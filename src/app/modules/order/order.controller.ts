/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderServices } from "./order.services";

/**
 * 🧾 Create checkout for normal course/package/event
 */
const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { provider, couponCode, courseId, itemType } = req.body;

  const data = await OrderServices.createCheckout(
    courseId,
    token.userId,
    provider,
    itemType,
    couponCode
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Checkout created successfully",
    data,
  });
});

/**
 * 🛒 Checkout for eCommerce (client-provided cart)
 * - Body: { items: [...], shippingAddress: {...}, currency?: "USD" }
 */
const checkoutEcommerce = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { items, shippingAddress, currency } = req.body;

  const session = await OrderServices.startEcommerceCheckoutFromClient({
    userId: token.userId,
    items,
    shippingAddress,
    currency: currency || "USD",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "E-commerce checkout session created successfully",
    data: session, // { orderId, sessionId, checkoutUrl }
  });
});

/**
 * 📦 Get my orders (student/instructor)
 */
const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const orders = await OrderServices.getMyOrders(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My orders fetched successfully",
    data: orders,
  });
});

/**
 * 📄 Get order details by orderId
 */
const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { orderId } = req.params;

  const doc = await OrderServices.getOrderById(orderId, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details retrieved successfully",
    data: doc,
  });
});

/**
 * 🔍 Get order details by Stripe/Toyyib sessionId
 */
const getOrderBySession = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { sessionId } = req.params;

  const doc = await OrderServices.getOrderBySessionId(sessionId, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order details retrieved successfully",
    data: doc,
  });
});

/**
 * 🧾 Admin: Get all orders (global list)
 */
const getOrders = catchAsync(async (req: Request, res: Response) => {
  const orders = await OrderServices.getOrders();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All orders retrieved successfully",
    data: orders,
  });
});

const fulfillEcommerce = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { id } = req.params;
  const result = await OrderServices.fulfillEcommerceOrder(
    id,
    req.body, // { status, trackingNumber?, carrier? }
    { userId: token.userId, role: token.role }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order fulfillment updated",
    data: result,
  });
});

const updateTracking = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { id } = req.params;
  const result = await OrderServices.updateEcommerceTracking(
    id,
    req.body, // { trackingNumber, carrier?, status? }
    { userId: token.userId, role: token.role }
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tracking updated",
    data: result,
  });
});

const markDelivered = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { id } = req.params;
  const result = await OrderServices.markEcommerceDelivered(
    id,
    req.body, // { deliveredAt? }
    { userId: token.userId, role: token.role }
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order marked delivered",
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { id } = req.params;
  const result = await OrderServices.cancelOrder(
    id,
    req.body, // { reason?, restock? }
    { userId: token.userId, role: token.role }
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Order cancelled",
    data: result,
  });
});


export const orderController = {
  createCheckout,
  checkoutEcommerce,
  getMyOrders,
  getOrderById,
  getOrderBySession,
  getOrders,
  fulfillEcommerce,
  updateTracking,
  markDelivered,
  cancelOrder,
};
