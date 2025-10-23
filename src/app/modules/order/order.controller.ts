/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrderServices } from "./order.services";

const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  
  const { provider, couponCode, courseId } = req.body;

  const data = await OrderServices.createCheckout(courseId, token.userId, provider, couponCode);

  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Checkout created", data });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const rows = await OrderServices.getMyOrders(token.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My orders", data: rows });
});

const getOrder = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { orderId } = req.params;
  const doc = await OrderServices.getOrder(orderId, { userId: token.userId, role: token.role });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Order details", data: doc });
});

export const orderController = { createCheckout, getMyOrders, getOrder };
