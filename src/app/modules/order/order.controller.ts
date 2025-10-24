/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderServices } from "./order.services";
import { get } from "mongoose";

const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  
  const { provider, couponCode, courseId, itemType } = req.body;

  const data = await OrderServices.createCheckout(courseId, token.userId, provider,itemType, couponCode);

  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Checkout created", data });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const rows = await OrderServices.getMyOrders(token.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My orders", data: rows });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { orderId } = req.params;
  const doc = await OrderServices.getOrderById(orderId, { userId: token.userId, role: token.role });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Order details", data: doc });
});

const getOrderBySession = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { sessionId } = req.params;
  const doc = await OrderServices.getOrderBySessionId(sessionId, { userId: token.userId, role: token.role });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Order details", data: doc });
});

const getOrders = catchAsync(async (req: Request, res: Response) => {
  const doc = await OrderServices.getOrders();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Order details", data: doc });
});
export const orderController = { createCheckout, getMyOrders, getOrderById, getOrderBySession, getOrders };
