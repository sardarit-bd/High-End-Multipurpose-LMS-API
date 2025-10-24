import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { GamificationServices } from "./gamification.service";

const getMyPoints = catchAsync(async (req: Request, res: Response) => {
  const me = req.user as JwtPayload;
  const data = await GamificationServices.getMyPoints(me.userId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "My points", data });
});

const leaderboard = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const courseId = req.query.courseId as string | undefined;
  const data = await GamificationServices.getLeaderboard(limit, courseId);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Leaderboard", data });
});

// optional: admin/instructor manual award
const award = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body; // { userId, points, sourceType, reason, courseId, eventId, taskId }
  const wallet = await GamificationServices.addPoints(payload);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Points awarded", data: wallet });
});

export const gamificationController = { getMyPoints, leaderboard, award };
