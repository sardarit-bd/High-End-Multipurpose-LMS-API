/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Order } from "./order.model";
import { Course } from "../course/course.model";
import { Product } from "../ecom/product/product.model";
import { PaymentService } from "../payment/payment.services";
import { OrderSource } from "./order.interface";


import { Types } from "mongoose";
import { GamificationServices } from "../gamification/gamification.service";
import { JwtPayload } from "jsonwebtoken";


const assertAdmin = (actor: { userId: string; role: string }) => {
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Admin only");
};

const ensureOrder = async (orderId: string) => {
  if (!Types.ObjectId.isValid(orderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid order id");
  }
  const ord = await Order.findById(orderId);
  if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  return ord;
};

/** Admin: mark e-commerce order as shipped/processing (sets tracking optionally) */
const fulfillEcommerceOrder = async (
  orderId: string,
  payload: { status?: "processing" | "shipped"; trackingNumber?: string; carrier?: string },
  actor: { userId: string; role: string }
) => {
  assertAdmin(actor);
  const ord = await ensureOrder(orderId);

  if (ord.itemType !== "ecommerce")
    throw new AppError(httpStatus.BAD_REQUEST, "Only e-commerce orders can be fulfilled");

  if (ord.status !== "paid")
    throw new AppError(httpStatus.BAD_REQUEST, "Only paid orders can be fulfilled");

  // Initialize subdoc if missing
  ord.ecommerce = ord.ecommerce || ({} as any);
  ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || ({} as any);

  // Update fields
  ord.ecommerce.fulfillment.status = payload?.status || "shipped";
  if (payload?.trackingNumber) ord.ecommerce.fulfillment.trackingNumber = payload?.trackingNumber;
  if (payload?.carrier) ord.ecommerce.fulfillment.carrier = payload?.carrier;
  if (payload?.status === "shipped") ord.ecommerce.fulfillment.shippedAt = new Date();

  await ord.save();
  return ord;
};

/** Admin: update tracking (optionally bump status to shipped/processing) */
const updateEcommerceTracking = async (
  orderId: string,
  payload: { trackingNumber: string; carrier?: string; status?: "processing" | "shipped" },
  actor: { userId: string; role: string }
) => {
  assertAdmin(actor);
  const ord = await ensureOrder(orderId);

  if (ord.itemType !== "ecommerce")
    throw new AppError(httpStatus.BAD_REQUEST, "Only e-commerce orders can be tracked");

  if (ord.status !== "paid")
    throw new AppError(httpStatus.BAD_REQUEST, "Only paid orders can be tracked");

  ord.ecommerce = ord.ecommerce || ({} as any);
  ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || ({} as any);

  ord.ecommerce.fulfillment.trackingNumber = payload.trackingNumber;
  if (payload.carrier) ord.ecommerce.fulfillment.carrier = payload.carrier;

  if (payload.status) {
    ord.ecommerce.fulfillment.status = payload.status;
    if (payload.status === "shipped") ord.ecommerce.fulfillment.shippedAt = new Date();
  }

  await ord.save();
  return ord;
};

/** Admin: mark delivered (idempotent) */
const markEcommerceDelivered = async (
  orderId: string,
  payload: { deliveredAt?: string },
  actor: { userId: string; role: string }
) => {
  assertAdmin(actor);
  const ord = await ensureOrder(orderId);

  if (ord.itemType !== "ecommerce")
    throw new AppError(httpStatus.BAD_REQUEST, "Only e-commerce orders can be delivered");

  if (ord.status !== "paid")
    throw new AppError(httpStatus.BAD_REQUEST, "Only paid orders can be delivered");

  ord.ecommerce = ord.ecommerce || ({} as any);
  ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || ({} as any);

  // If already delivered, return as-is (idempotent)
  if (ord.ecommerce.fulfillment.status === "delivered") return ord;

  ord.ecommerce.fulfillment.status = "delivered";
  ord.ecommerce.fulfillment.deliveredAt = payload?.deliveredAt
    ? new Date(payload?.deliveredAt)
    : new Date();

  await ord.save();

  // Optional: tiny bonus points for delivered orders
  const bonus = Math.max(1, Math.floor((ord.amount || 0) / 100)); // e.g., 1pt per $100
  if (bonus > 0) {
    await GamificationServices.addPoints({
      userId: String(ord.user),
      points: bonus,
      sourceType: "purchase",
      reason: "Order delivered bonus",
    });
  }

  return ord;
};

/** Admin: cancel order (stub). If you want refunds, integrate provider’s refund API */
const cancelOrder = async (
  orderId: string,
  payload: { reason?: string; restock?: boolean },
  actor: { userId: string; role: string }
) => {
  assertAdmin(actor);
  const ord = await ensureOrder(orderId);

  if (ord.status === "paid") {
    // Decide your policy. Typically:
    // 1) Initiate provider refund (Stripe/PayPal) — not implemented here
    // 2) If restock true and ecommerce, add stock back
    if (payload.restock && ord.source === "ecommerce" && ord.ecommerce?.items?.length) {
      for (const it of ord.ecommerce.items) {
        const prod: any = await Product.findById(it.product);
        if (!prod) continue;
        if (it.variantId && Array.isArray(prod.variants)) {
          const idx = prod.variants.findIndex((v: any) => String(v._id) === String(it.variantId));
          if (idx >= 0) prod.variants[idx].stock = (prod.variants[idx].stock || 0) + it.qty;
        } else {
          prod.stock = (prod.stock || 0) + it.qty;
        }
        await prod.save();
      }
    }
  }

  ord.status = "cancelled";
  // Optionally record reason somewhere (add a cancellations array if you want audits)
  await ord.save();
  return ord;
};




const resolvePrice = async (course: any, couponCode?: string) => {
  // TODO: add coupon/discount logic here
  return { price: course.price ?? 0, currency: course.currency ?? "USD" };
};

/* ----------------------- NORMAL COURSE CHECKOUT ----------------------- */
const createCheckout = async (
  courseId: string,
  userId: string,
  provider: "stripe" | "paypal" | "toyyibpay",
  itemType: OrderSource,
  couponCode?: string,
  billingInfo?: {}
) => {
  const course = await Course.findById(courseId);
  if (!course || (course as any).isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const { price, currency } = await resolvePrice(course, couponCode);
  // Handle free courses - auto-complete order and enroll
  if (price === 0) {
    const order = await Order.create({
      user: userId,
      course: courseId,
      price,
      currency,
      provider: `"free"_${Math.random() * 100 * 100}`, // Special provider for free courses
      itemType,
      status: "paid", // Mark as completed immediately
      couponCode,
      billingInfo
    });


    // Auto-enroll the user in the free course
    const { EnrollmentServices } = await import('../enrollment/enrollment.services');

     
     await EnrollmentServices.enrollSelf(courseId, userId, course?.instructor?.toString());

    // Award enrollment points for free course
    const { GamificationServices } = await import('../gamification/gamification.service');
    await GamificationServices.addPoints({
      userId,
      points: 20,
      sourceType: "enrollment",
      courseId: courseId,
      reason: "Free course enrollment",
    });


    const res = await Course.findByIdAndUpdate(
      courseId,
      {
        $inc: { noOfStudents: 1 },
      },
      { new: true }
    );

    return {
      orderId: String(order._id),
      checkoutUrl: null, // No payment URL needed for free courses
      isFree: true,
      message: "Enrolled successfully in free course!"
    };
  }

  // Handle paid courses - create payment session
  const order = await Order.create({
    user: userId,
    course: courseId,
    price,
    currency,
    provider,
    itemType,
    status: "pending",
    couponCode,
    billingInfo
  });

  const session = await PaymentService.createCheckoutSession({
    provider,
    orderId: String(order._id),
    amount: price * 100,
    currency,
    courseId: String(course._id),
    userId: String(userId),
    source: itemType,
  });

  order.providerSessionId = session.sessionId;
  await order.save();

  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};

const createDonationCheckout = async (
  fund: string,
  userId: string,
  provider: "stripe" | "paypal" | "toyyibpay",
  amount: number
) => {


  // Handle paid courses - create payment session
  const order = await Order.create({
    user: userId,
    fund: fund,
    price: amount,
    currency: "USD",
    provider,
    itemType: "Donation",
    status: "pending",
  });

  const session = await PaymentService.createCheckoutSession({
    provider,
    orderId: String(order._id),
    amount: amount,
    currency: 'USD',
    userId: String(userId),
    source: "event"
  });

  order.providerSessionId = session.sessionId;
  await order.save();

  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};
/* ----------------------- PACKAGE CHECKOUT ----------------------- */
const createCheckoutForPackage = async (input: {
  packageId: string;
  userId: string;
  amount: number;
  currency: string;
  courseIds: string[];
  name: Record<string, string>;
}) => {
  const order = await Order.create({
    user: input.userId,
    package: { id: input.packageId, name: input.name },
    courseIds: input.courseIds,
    price: input.amount,
    currency: input.currency,
    provider: "stripe",
    status: "pending",
    itemType: "package",
  });

  const session = await PaymentService.createCheckoutSession({
    provider: "stripe",
    orderId: String(order._id),
    amount: input.amount * 100,
    currency: input.currency,
    packageId: input.packageId,
    userId: input.userId,
    source: "package",
  });
  order.providerSessionId = session.sessionId;
  await order.save();
  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};

/* ----------------------- ECOMMERCE CHECKOUT (CLIENT CART) ----------------------- */

type ClientEcomInput = {
  userId: string;
  shippingAddress: any;
  items: Array<{
    product: string;
    variantId?: string;
    qty: number;
    unitPrice: number;
    title: Record<string, string>;
    image?: string;
  }>;
  currency?: string;
};

const startEcommerceCheckoutFromClient = async (input: any) => {
  const items = input?.payload?.items ?? [];

  if (!items.length)
    throw new AppError(httpStatus.BAD_REQUEST, "No items found to checkout");

  const verifiedLines = [];

  for (const line of items) {
    const prod = await Product.findById(line.product);
    if (!prod || !prod.isActive)
      throw new AppError(httpStatus.BAD_REQUEST, "Product not available");

    let effectivePrice = prod.price;
    let effectiveStock = prod.stock;


    if (effectiveStock < line.qty) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");
    }

    if (line.price !== effectivePrice) {
      // Protect from tampered FE prices
      throw new AppError(httpStatus.BAD_REQUEST, "Price mismatch. Refresh page.");
    }

    verifiedLines.push({
      product: prod._id,
      qty: line.quantity,
      unitPrice: effectivePrice,
      title: line.title || prod.title,
      image: line.image || prod.images?.[0],
    });
  }


  const subtotal = verifiedLines.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const discount = 0;
  const shippingFee = 0;
  const tax = .1;
  const total = subtotal - discount + shippingFee + (subtotal - discount + shippingFee) * tax;

  const order = await Order.create({
    user: input.userId,
    provider: input?.payload?.provider,
    status: "pending",
    source: "ecommerce",
    price: total,
    itemType: "ecommerce",

    currency: input.currency || "USD",
    ecommerce: {
      items: verifiedLines,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      shippingAddress: input?.payload?.shippingAddress,
      fulfillment: { status: "unfulfilled" },
    },
  });

  const { sessionId, checkoutUrl } =
    await PaymentService.createCheckoutSession({
      provider: input?.payload?.provider,
      source: "ecommerce",
      orderId: String(order._id),
      amount: total * 100,
      currency: input.currency || "USD",
      userId: input.userId,
    });

  order.providerSessionId = sessionId;
  await order.save();

  return { sessionId, checkoutUrl };
};

/* ----------------------- ORDERS FETCHING ----------------------- */
const getMyOrders = async (userId: string) =>{
  const orders = await Order.find({ user: userId, isDeleted: false }).sort({ createdAt: -1 });
  return orders
}

const getOrderById = async (
  orderId: string,
  actor: { userId: string; role: string }
) => {
  const ord = await Order.findById(orderId);
  if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");

  const isOwner = String(ord.user) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!(isOwner || isAdmin))
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  return ord;
};

const getOrderBySessionId = async (
  sessionId: string,
  actor: { userId: string; role: string }
) => {
  const ord = await Order.findOne({ providerSessionId: sessionId });
  if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");

  const isOwner = String(ord.user) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!(isOwner || isAdmin))
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  return ord;
};

const getOrders = async (query: any = {}) => {
  const { q, page = 1, limit = 10 } = query;

  // Build aggregation pipeline
  const pipeline: any = [
    {
      $match: { isDeleted: false }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      },
    },
    {
      $unwind: {
        path: "$userData",
        preserveNullAndEmptyArrays: true
      }
    },
    {
    $lookup: {
      from: "events",
      localField: "event",
      foreignField: "_id",
      as: "eventData"
    }
  },
  {
    $unwind: {
      path: "$eventData",
      preserveNullAndEmptyArrays: true
    }
  },
  ];

  // Add search filter if query exists
  if (q) {
    pipeline.push({
      $match: {
        $or: [
          { providerPaymentId: { $regex: q, $options: 'i' } },
          { "userData.name": { $regex: q, $options: 'i' } },
          { "userData.email": { $regex: q, $options: 'i' } }
        ]
      }
    });
  }

  // Add projection and pagination stages
  pipeline.push(
    {
      $project: {
        transactionId: {
          $cond: {
            if: { $and: [{ $ne: ["$providerPaymentId", null] }, { $ne: ["$providerPaymentId", ""] }] },
            then: "$providerPaymentId",
            else: { $toString: "$_id" }
          }
        },
        userName: "$userData.name",
        userEmail: "$userData.email",
        amount: "$price",
        currency: "$currency",
        date: "$createdAt",
        status: "$status",
        itemType: "$itemType",
        provider: "$provider",
        course: 1,
        ecommerce: 1,
        createdAt: 1,
        fund: 1,
        event: "$eventData.title"
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $skip: (page - 1) * limit
    },
    {
      $limit: limit * 1
    }
  );

  // Clone pipeline for count (remove pagination stages)
  const countPipeline = [...pipeline];
  countPipeline.splice(-3, 3); // Remove sort, skip, limit stages

  // Execute queries
  const [orders, countResult] = await Promise.all([
    Order.aggregate(pipeline),
    Order.aggregate([...countPipeline, { $count: "total" }])
  ]);

  const total = countResult[0]?.total || 0;

  // Format the data
  const formattedOrders = orders.map(order => ({
    ...order,
    amountFormatted: `${order.amount.toFixed(2)} ${order.currency.toUpperCase()}`,
    dateFormatted: new Date(order.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));

  return {
    orders: formattedOrders,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const createCheckoutForEvent = async (input: {
  eventId: string;
  userId: string;
  amount: number;
  currency: string;
  name: Record<string, string>;
}) => {
  const order = await Order.create({
    user: input.userId,
    event: input.eventId,
    price: input.amount,
    currency: input.currency,
    provider: "stripe",
    status: "pending",
    itemType: "event",
  });

  const session = await PaymentService.createCheckoutSession({
    provider: "stripe",
    orderId: String(order._id),
    amount: input.amount * 100,
    currency: input.currency,
    eventId: input.eventId,
    userId: input.userId,
    source: "event",
  });
  order.providerSessionId = session.sessionId;
  await order.save();
  return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};

/* ----------------------- EXPORT ----------------------- */
export const OrderServices = {
  createCheckout,
  createCheckoutForPackage,
  startEcommerceCheckoutFromClient,
  getMyOrders,
  getOrderById,
  getOrderBySessionId,
  getOrders,

  fulfillEcommerceOrder,
  updateEcommerceTracking,
  markEcommerceDelivered,
  cancelOrder,
  createDonationCheckout,
  createCheckoutForEvent
};
