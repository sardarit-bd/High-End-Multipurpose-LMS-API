/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UnitServices } from "./unit.services";

const createUnit = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.user as JwtPayload; // expects { userId, role }

  const created = await UnitServices.createUnit(req.body, {
    userId: token.userId, role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Unit Created Successfully",
    data: created,
  });
});

const listUnits = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const items = await UnitServices.listUnits(courseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Units fetched",
    data: items,
  });
});

export const unitController = { createUnit, listUnits };
