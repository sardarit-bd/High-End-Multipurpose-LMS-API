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

const getLeaderboard = catchAsync(async (req, res) => {
  const { limit, scope, value, courseId } = req.query;
  const data = await GamificationServices.getLeaderboard(
    Number(limit) || 20,
    (scope as any) || "global",
    value as string,
    courseId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leaderboard fetched successfully",
    data,
  });
});

// optional: admin/instructor manual award
const award = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body; // { userId, points, sourceType, reason, courseId, eventId, taskId }
  const wallet = await GamificationServices.addPoints(payload);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Points awarded", data: wallet });
});

export const gamificationController = { getMyPoints, getLeaderboard, award };
