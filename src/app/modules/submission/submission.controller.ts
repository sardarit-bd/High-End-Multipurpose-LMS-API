/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SubmissionServices } from "./submission.services";

const createReviewedSubmission = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { taskId } = req.params;

  const created = await SubmissionServices.createReviewedSubmission(taskId, token.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Submission created (pending review)",
    data: created,
  });
});

const gradeSubmission = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { taskId, submissionId } = req.params;

  const updated = await SubmissionServices.gradeSubmission(
    taskId,
    submissionId,
    { userId: token.userId, role: token.role },
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission graded",
    data: updated,
  });
});

const getMyCourseTotal = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;

  const total = await SubmissionServices.myCourseTotal(courseId, token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My course points",
    data: total,
  });
});



export const submissionController = {
  createReviewedSubmission,
  gradeSubmission,
  getMyCourseTotal
};
