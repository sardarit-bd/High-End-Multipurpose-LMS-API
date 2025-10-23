import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { Enrollment } from "../modules/enrollment/enrollment.model";

export const checkEnrollment = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;

  const doc = await Enrollment.findOne({ course: courseId, user: token.userId, isDeleted: false });
  if (!doc) throw new AppError(httpStatus.FORBIDDEN, "Please enroll (or complete payment) to access this content");

  return next();
};
