/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Order } from "./order.model";
import { Course } from "../course/course.model";
import { PaymentService } from "../payment/payment.services";
import { OrderSource } from "./order.interface";

const resolvePrice = async (course: any, couponCode?: string) => {
    // TODO: add coupons/discount logic here
    return { price: course.price ?? 0, currency: course.currency ?? "USD" };
};


type StartEcomInput = {
  userId: string;
  shippingAddress: any;
  items?: Array<{
    product: string;
    variantId?: string;
    qty: number;
    unitPrice: number;
    title: Record<string, string>;
    image?: string;
  }>;
};

const startEcommerceCheckout = async (input: StartEcomInput) => {
  // TODO when Cart module is ready: read items from CartServices.get(userId)
  const items = input.items ?? [];
  if (!items.length) {
    throw new AppError(httpStatus.BAD_REQUEST, "No items found to checkout");
  }

  const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
  const discount = 0;        // TODO: apply coupon later
  const shippingFee = 0;     // TODO: shipping calc
  const tax = 0;             // TODO: tax calc
  const total = subtotal - discount + shippingFee + tax;

  // 1) Create pending order
  const order = await Order.create({
    user: input.userId,
    provider: "stripe",         // or from settings
    status: "pending",
    source: "ecommerce",
    amount: total,
    currency: "USD",            // or from settings
    ecommerce: {
      items: items.map(it => ({
        product: it.product,
        variantId: it.variantId,
        qty: it.qty,
        unitPrice: it.unitPrice,
        title: it.title,
        image: it.image
      })),
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      shippingAddress: input.shippingAddress,
      fulfillment: { status: "unfulfilled" }
    }
  });

  // 2) Create provider session (you already do this elsewhere)
  const { sessionId, checkoutUrl } = await PaymentService.createCheckoutSession({
    provider: "stripe",
    source: "ecommerce",
    userId: input.userId,
    // the minimum fields PaymentService needs:
    orderId: String(order._id),      // <= include this in your CreateSessionInput type if missing
    amount: order.amount,
    currency: order.currency,
    // you can pass line items to Stripe here too if your provider supports
  });

  order.providerSessionId = sessionId;
  await order.save();

  return { orderId: String(order._id), sessionId, checkoutUrl };
};
const createCheckout = async (courseId: string, userId: string, provider: "stripe" | "paypal" | "toyyibpay", itemType: OrderSource, couponCode?: string) => {
    const course = await Course.findById(courseId);

    if (!course || (course as any).isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

    const { price, currency } = await resolvePrice(course, couponCode);
    const order = await Order.create({
        user: userId,
        course: courseId,
        price,
        currency,
        provider,
        itemType,
        status: "pending", couponCode
    });

    const session = await PaymentService.createCheckoutSession({
        provider,
        orderId: String(order._id),
        amount: price,
        currency,
        courseId: String(course._id),
        userId: String(userId),
        source: itemType
    });

    order.providerSessionId = session.sessionId;
    await order.save();

    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};


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
        course: undefined,
        package: { id: input.packageId, name: input.name },
        courseIds: input.courseIds,
        price: input.amount,
        currency: input.currency,
        provider: "stripe",
        status: "pending",
        itemType: "package"
    });

    const session = await PaymentService.createCheckoutSession({
        provider: "stripe",
        orderId: String(order._id),
        amount: input.amount,
        currency: input.currency,
        packageId: input.packageId, // human-readable
        userId: input.userId,
        source: "package"
    });

    order.providerSessionId = session.sessionId;
    await order.save();

    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
};



const getMyOrders = async (userId: string) => Order.find({ user: userId, isDeleted: false }).sort({ createdAt: -1 });
const getOrderById = async (orderId: string, actor: { userId: string; role: string }) => {
    const ord = await Order.findById(orderId);
    if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
    const isOwner = String(ord.user) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!(isOwner || isAdmin)) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
    return ord;
};

const getOrderBySessionId = async (sessionId: string, actor: { userId: string; role: string }) => {
    const ord = await Order.findOne({ providerSessionId: sessionId });
    if (!ord) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");
    const isOwner = String(ord.user) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!(isOwner || isAdmin)) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
    return ord;
};
const getOrders = async () => Order.find({ isDeleted: false }).sort({ createdAt: -1 });
export const OrderServices = { createCheckout, getMyOrders, getOrderById, getOrders, createCheckoutForPackage, getOrderBySessionId, startEcommerceCheckout };
