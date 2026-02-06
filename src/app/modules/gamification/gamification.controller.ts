import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { GamificationServices } from "./gamification.service";

const getMyPoints = catchAsync(async (req: Request, res: Response) => {
  const me = req.user as JwtPayload;
  const data = await GamificationServices.getMyPoints(me.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My points",
    data
  });
});

const getLeaderboard = catchAsync(async (req, res) => {
  const { limit, scope, value, courseId, schoolId, cityId } = req.query;
  const data = await GamificationServices.getLeaderboard(
    {
      limit: Number(limit) || 20,
      scope: (scope as any) || "global",
      value: value as string,
      courseId: courseId as string,
      schoolId: schoolId as string,
      cityId: cityId as string
    }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Leaderboard fetched successfully",
    data,
  });
});

const getSchoolsLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { limit, schoolId } = req.query;
  const data = await GamificationServices.getSchoolsLeaderboard(
    Number(limit) || 20,
    schoolId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schools leaderboard fetched successfully",
    data,
  });
});

const getCitiesLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { limit, cityId } = req.query;
  const data = await GamificationServices.getCitiesLeaderboard(
    Number(limit) || 20,
    cityId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cities leaderboard fetched successfully",
    data,
  });
});

const getMyRank = catchAsync(async (req: Request, res: Response) => {
  const me = req.user as JwtPayload;
  const { scope, scopeId, courseId } = req.query;

  const data = await GamificationServices.getStudentRank(
    me.userId,
    (scope as any) || "global",
    scopeId as string,
    courseId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rank fetched successfully",
    data,
  });
});

// optional: admin/instructor manual award
const award = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body; // { userId, points, sourceType, reason, courseId, eventId, taskId }
  const wallet = await GamificationServices.addPoints(payload);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Points awarded",
    data: wallet
  });
});

export const gamificationController = {
  getMyPoints,
  getLeaderboard,
  getSchoolsLeaderboard,
  getCitiesLeaderboard,
  getMyRank,
  award
};