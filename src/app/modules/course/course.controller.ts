/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CourseServices } from "./course.services";
import { ICourse } from "./course.interface";

const createCourse = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.user as JwtPayload;
  const payload = { ...req.body, instructor: token.userId };

  const created = await CourseServices.createCourse(payload);

  sendResponse<ICourse>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course Created Successfully",
    data: created as unknown as ICourse,
  });
});

const listCourses = catchAsync(async (req: Request, res: Response) => {
  const { items, meta } = await CourseServices.listCourses(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses fetched",
    data: items,
    meta,
  });
});

const getCourse = catchAsync(async (req: Request, res: Response) => {
  const course = await CourseServices.getCourseBySlug(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details fetched",
    data: course,
  });
});


const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  
  const updated = await CourseServices.updateCourse(req.params.id, req.body, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course Updated Successfully",
    data: updated,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  await CourseServices.softDeleteCourse(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course Deleted",
    data: null,
  });
});

export const courseController = {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};
