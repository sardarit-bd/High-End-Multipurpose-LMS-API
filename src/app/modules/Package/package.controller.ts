/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PackageServices } from "./package.services";

const packageCreate = catchAsync(async (req: Request, res: Response) => {
  const data = await PackageServices.packageCreate(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Package created", data });
});

const packageUpdate = catchAsync(async (req: Request, res: Response) => {
  const data = await PackageServices.packageUpdate(req.params.packageId, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Package updated", data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const data = await PackageServices.packageSoftDelete(req.params.packageId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Package deleted", data });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const data = await PackageServices.packageGet(req.params.packageId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Package details", data });
});

const listPublic = catchAsync(async (_req: Request, res: Response) => {
  const data = await PackageServices.packageListPublic();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Packages", data });
});

const createCheckout = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const data = await PackageServices.createCheckout(req.body.packageId, token.userId);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Checkout created", data });
});

export const packageController = {packageCreate, createCheckout,packageUpdate, remove, get, listPublic };
