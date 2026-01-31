/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BadgeServices } from "./badge.service";
import { JwtPayload } from "jsonwebtoken";
import { PointWallet } from "../gamification/gamification.model";
import { Enrollment } from "../enrollment/enrollment.model";

const create = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Badge created successfully",
    data: badge,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.update(req.params.badgeId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge updated successfully",
    data: badge,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.remove(req.params.badgeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge deleted successfully",
    data: badge,
  });
});

const listAll = catchAsync(async (req: Request, res: Response) => {
  // Extract query parameters for pagination and search
  const {
    q = "",
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    sortOrder = "desc",
    ...filters
  } = req.query;
  
  const result = await BadgeServices.listAll({
    q: q as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    sortBy: sortBy as string,
    sortOrder: sortOrder as string,
    ...filters
  });
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badges retrieved successfully",
    data: result,
  });
});

const issue = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.issueBadge(
    req.body.userId, 
    req.body.badgeId, 
    req.body.reason
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge issued successfully",
    data: badge,
  });
});

const myBadges = catchAsync(async (req: Request, res: Response) => {
  const me = req.user as JwtPayload;
  const badges = await BadgeServices.listUserBadges(me.userId);
  const totalPoints = await PointWallet.findOne({
    user: me.userId
  })
  const totalCourse = await Enrollment.countDocuments({user: me.userId})
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User badges retrieved successfully",
    data: {
      badges,
      totalPoints: totalPoints?.totalPoints,
      totalCourse
    },
  });
});

// New controller for getting a single badge
const getById = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.getById(req.params.badgeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge retrieved successfully",
    data: badge,
  });
});

// New controller for toggling badge status
const toggleStatus = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.toggleStatus(req.params.badgeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Badge ${badge.isActive ? 'activated' : 'deactivated'} successfully`,
    data: badge,
  });
});

export const badgeController = { 
  create, 
  update, 
  remove, 
  listAll, 
  issue, 
  myBadges,
  getById,
  toggleStatus 
};