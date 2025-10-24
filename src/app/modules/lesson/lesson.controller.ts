/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { LessonServices } from "./lesson.services";

const createLesson = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.user as JwtPayload; // expects { userId, role }

  const created = await LessonServices.createLesson(req.body, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Lesson Created Successfully",
    data: created,
  });
});

const listLessons = catchAsync(async (req: Request, res: Response) => {
  const { unitId } = req.params;
  const items = await LessonServices.listLessons(unitId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lessons fetched",
    data: items,
  });
});

const completeLesson = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  const { lessonId } = req.body;
  const { courseId } = await LessonServices.resolveCourseFromLesson(lessonId);

  await LessonServices.markCompleted(token.userId, courseId, lessonId);

  // NOTE: Points for quiz correctness & attendance will be added in their own endpoints.
  // We keep lesson completion lean here (no auto points).
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Lesson marked as completed",
    data: { courseId, lessonId }
  });
})
export const lessonController = { createLesson, listLessons, completeLesson };
