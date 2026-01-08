/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TaskServices } from "./task.services";

const createTask = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const { unitId } = req.body;
  const token = req.user as JwtPayload;
  const created = await TaskServices.create(unitId, req.body, { userId: token.userId, role: token.role });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task created",
    data: created,
  });
});

const listTasks = catchAsync(async (req: Request, res: Response) => {
  const { unitId } = req.params;
  const items = await TaskServices.listByUnit(unitId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks fetched",
    data: items,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.user as JwtPayload;
  const updated = await TaskServices.update(id, req.body, { userId: token.userId, role: token.role });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated",
    data: updated,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = req.user as JwtPayload;
  await TaskServices.remove(id, { userId: token.userId, role: token.role });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted",
    data: null,
  });
});

export const taskController = { createTask, listTasks, updateTask, deleteTask };
