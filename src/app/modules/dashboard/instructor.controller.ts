import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { getInstructorDashboard, getInstructorStats, getMonthlyEarnings, getRecentSubmissions, getTopCourses, getUnevaluatedTasks } from "./instructor.services";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes'

export const getStats = catchAsync(async (req: Request, res: Response) => {
     const user = req.user as JwtPayload
  const instructorId = user.userId;

  const stats = await getInstructorStats(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor statistics retrieved successfully",
    data: stats
  });
});

export const getTopPerformingCourses = catchAsync(async (req: Request, res: Response) => {
      const user = req.user as JwtPayload
  const instructorId = user.userId;
  const limit = parseInt(req.query.limit as string) || 5;

  const topCourses = await getTopCourses(instructorId, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Top courses retrieved successfully",
    data: topCourses
  });
});


export const getRecentTaskSubmissions = catchAsync(async (req: Request, res: Response) => {
      const user = req.user as JwtPayload
  const instructorId = user.userId;
  const limit = parseInt(req.query.limit as string) || 10;

  const submissions = await getRecentSubmissions(instructorId, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent submissions retrieved successfully",
    data: submissions
  });
});


export const getPendingTasks = catchAsync(async (req: Request, res: Response) => {
      const user = req.user as JwtPayload
  const instructorId = user.userId;

  const tasks = await getUnevaluatedTasks(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Unevaluated tasks retrieved successfully",
    data: tasks
  });
});


export const getEarningsData = catchAsync(async (req: Request, res: Response) => {
      const user = req.user as JwtPayload
  const instructorId = user.userId;
  const months = parseInt(req.query.months as string) || 12;

  const earnings = await getMonthlyEarnings(instructorId, months);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly earnings retrieved successfully",
    data: earnings
  });
});


export const getDashboard = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload
  const instructorId = user.userId;

  const dashboard = await getInstructorDashboard(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboard
  });
});