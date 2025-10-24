/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BadgeServices } from "./badge.service";
import { JwtPayload } from "jsonwebtoken";

const create = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Badge created",
    data: badge,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.update(req.params.badgeId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge updated",
    data: badge,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.remove(req.params.badgeId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge deleted",
    data: badge,
  });
});

const listAll = catchAsync(async (_req: Request, res: Response) => {
  const badges = await BadgeServices.listAll();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All badges",
    data: badges,
  });
});

const issue = catchAsync(async (req: Request, res: Response) => {
  const badge = await BadgeServices.issueBadge(req.body.userId, req.body.badgeId, req.body.reason);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Badge issued",
    data: badge,
  });
});

const myBadges = catchAsync(async (req: Request, res: Response) => {
  const me = req.user as JwtPayload;
  const badges = await BadgeServices.listUserBadges(me.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My badges",
    data: badges,
  });
});

export const badgeController = { create, update, remove, listAll, issue, myBadges };
