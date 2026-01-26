import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DashboardServices } from "./dashboard.services";


const getInstructorDashboard = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const dashboardData = await DashboardServices.getInstructorDashboard(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor dashboard data fetched successfully",
    data: dashboardData,
  });
});

const getInstructorStats = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const stats = await DashboardServices.getInstructorStats(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor stats fetched successfully",
    data: stats,
  });
});

const getEarningsChart = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const earningsData = await DashboardServices.getEarningsChart(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Earnings chart data fetched successfully",
    data: earningsData,
  });
});

const getCourseStats = catchAsync(async (req: Request, res: Response) => {
  const instructorId = req.params.instructorId;
  const stats = await DashboardServices.getCourseStats(instructorId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course stats fetched successfully",
    data: stats,
  });
});

const getStudentDashboard = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const dashboardData = await DashboardServices.getStudentDashboard(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student dashboard data fetched successfully",
    data: dashboardData,
  });
});


const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const stats = await DashboardServices.getAdminStats()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin stats fetched successfully",
    data: stats,
  });
});

export const DashboardController = {
  getInstructorDashboard,
  getInstructorStats,
  getEarningsChart,
  getCourseStats,
  getStudentDashboard,
  getAdminStats
};