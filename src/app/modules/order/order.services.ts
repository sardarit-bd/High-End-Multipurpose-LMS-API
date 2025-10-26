/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Order } from "./order.model";
import { Course } from "../course/course.model";
import { Product } from "../ecom/product/product.model";
import { PaymentService } from "../payment/payment.services";
import { OrderSource } from "./order.interface";


import { Types } from "mongoose";
import { Role } from "../user/user.interface";
import { GamificationServices } from "../gamification/gamification.services";
import { Product } from "../ecom/product/product.model";

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
  payload: { status: "processing" | "shipped"; trackingNumber?: string; carrier?: string },
  actor: { userId: string; role: string }
) => {
  assertAdmin(actor);
  const ord = await ensureOrder(orderId);

  if (ord.source !== "ecommerce")
    throw new AppError(httpStatus.BAD_REQUEST, "Only e-commerce orders can be fulfilled");

  if (ord.status !== "paid")
    throw new AppError(httpStatus.BAD_REQUEST, "Only paid orders can be fulfilled");

  // Initialize subdoc if missing
  ord.ecommerce = ord.ecommerce || ({} as any);
  ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || ({} as any);

  // Update fields
  ord.ecommerce.fulfillment.status = payload.status;
  if (payload.trackingNumber) ord.ecommerce.fulfillment.trackingNumber = payload.trackingNumber;
  if (payload.carrier) ord.ecommerce.fulfillment.carrier = payload.carrier;
  if (payload.status === "shipped") ord.ecommerce.fulfillment.shippedAt = new Date();

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

  if (ord.source !== "ecommerce")
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

  if (ord.source !== "ecommerce")
    throw new AppError(httpStatus.BAD_REQUEST, "Only e-commerce orders can be delivered");

  if (ord.status !== "paid")
    throw new AppError(httpStatus.BAD_REQUEST, "Only paid orders can be delivered");

  ord.ecommerce = ord.ecommerce || ({} as any);
  ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || ({} as any);

  // If already delivered, return as-is (idempotent)
  if (ord.ecommerce.fulfillment.status === "delivered") return ord;

  ord.ecommerce.fulfillment.status = "delivered";
  ord.ecommerce.fulfillment.deliveredAt = payload.deliveredAt
    ? new Date(payload.deliveredAt)
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
  couponCode?: string
) => {
  const course = await Course.findById(courseId);
  if (!course || (course as any).isDeleted)
    throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const { price, currency } = await resolvePrice(course, couponCode);

  const order = await Order.create({
    user: userId,
    course: courseId,
    price,
    currency,
    provider,
    itemType,
    status: "pending",
    couponCode,
  });

  const session = await PaymentService.createCheckoutSession({
    provider,
    orderId: String(order._id),
    amount: price,
    currency,
    courseId: String(course._id),
    userId: String(userId),
    source: itemType,
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
    amount: input.amount,
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

const startEcommerceCheckoutFromClient = async (input: ClientEcomInput) => {
  const items = input.items ?? [];
  
  if (!items.length)
    throw new AppError(httpStatus.BAD_REQUEST, "No items found to checkout");

  const verifiedLines = [];

  for (const line of items) {
    const prod = await Product.findById(line.product);
    if (!prod || !prod.isActive)
      throw new AppError(httpStatus.BAD_REQUEST, "Product not available");

    let effectivePrice = prod.price;
    let effectiveStock = prod.stock;

    if (line.variantId && Array.isArray(prod.variants) && prod.variants.length) {
      const v = prod.variants.find(
        (vv: any) => String(vv._id) === String(line.variantId)
      );
      if (!v) throw new AppError(httpStatus.BAD_REQUEST, "Variant not found");
      effectivePrice = typeof v.price === "number" ? v.price : prod.price;
      effectiveStock = v.stock;
    }

    if (effectiveStock < line.qty) {
      throw new AppError(httpStatus.BAD_REQUEST, "Insufficient stock");
    }

    if (line.unitPrice !== effectivePrice) {
      // Protect from tampered FE prices
      throw new AppError(httpStatus.BAD_REQUEST, "Price mismatch. Refresh page.");
    }

    verifiedLines.push({
      product: prod._id,
      variantId: line.variantId,
      qty: line.qty,
      unitPrice: effectivePrice,
      title: line.title || prod.title,
      image: line.image || prod.images?.[0],
    });
  }

  const subtotal = verifiedLines.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const discount = 0;
  const shippingFee = 0;
  const tax = 0;
  const total = subtotal - discount + shippingFee + tax;

  const order = await Order.create({
    user: input.userId,
    provider: "stripe",
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
      shippingAddress: input.shippingAddress,
      fulfillment: { status: "unfulfilled" },
    },
  });

  const { sessionId, checkoutUrl } =
    await PaymentService.createCheckoutSession({
      provider: "stripe",
      source: "ecommerce",
      orderId: String(order._id),
      amount: total,
      currency: input.currency || "USD",
      userId: input.userId,
    });

  order.providerSessionId = sessionId;
  await order.save();

  return { sessionId, checkoutUrl };
};

/* ----------------------- ORDERS FETCHING ----------------------- */
const getMyOrders = async (userId: string) =>
  Order.find({ user: userId, isDeleted: false }).sort({ createdAt: -1 });

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

const getOrders = async () =>
  Order.find({ isDeleted: false }).sort({ createdAt: -1 });

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
};
