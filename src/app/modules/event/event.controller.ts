/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { EventServices } from "./event.service";
import { IEvent } from "./event.interface";

const create = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as JwtPayload;
  const event = await EventServices.create(req.body, actor.userId);
  sendResponse<IEvent>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const event = await EventServices.update(req.params.eventId, req.body);
  sendResponse<IEvent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated",
    data: event,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const event = await EventServices.remove(req.params.eventId);
  sendResponse<IEvent>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted",
    data: event,
  });
});

const listPublic = catchAsync(async (_req: Request, res: Response) => {
  const events = await EventServices.listPublic();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events fetched",
    data: events,
  });
});

const get = catchAsync(async (req: Request, res: Response) => {
  const event = await EventServices.get(req.params.eventId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event details",
    data: event,
  });
});

const register = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as JwtPayload;
  const event = await EventServices.register(req.params.eventId, actor.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Registered for event",
    data: event,
  });
});

const markAttendance = catchAsync(async (req: Request, res: Response) => {
  const actor = req.user as JwtPayload;
  const data = await EventServices.markAttendance(req.params.eventId, actor.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Attendance marked",
    data,
  });
});

export const eventController = {
  create,
  update,
  remove,
  listPublic,
  get,
  register,
  markAttendance,
};
