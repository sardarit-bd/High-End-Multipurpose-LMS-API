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
  const { taskId, submissionId } = req.body;

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

const getMySubmissionsByUnit = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { unitId } = req.params;

  const submissions = await SubmissionServices.getMySubmissionsByUnit(unitId, token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My submissions for unit",
    data: submissions,
  });
});

const getMyTaskSubmission = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { taskId } = req.params;

  const submission = await SubmissionServices.getMyTaskSubmission(taskId, token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My task submission",
    data: submission,
  });
});

const getMyAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;

  const submission = await SubmissionServices.getMyAllSubmission(token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My All submission",
    data: submission,
  });
});

const getSubmissionsForReview = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { taskId } = req.params;

  const submissions = await SubmissionServices.getSubmissionsForReview(taskId, token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submissions pending review",
    data: submissions,
  });
});

const reviewSubmission = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { submissionId } = req.params;

  const reviewed = await SubmissionServices.reviewSubmission(
    submissionId,
    { userId: token.userId, role: token.role },
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission reviewed successfully",
    data: reviewed,
  });
});



const getSubmissionsByUnit = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { unitId } = req.params;

  const submissions = await SubmissionServices.getSubmissionsByUnit(unitId, token.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submissions for unit",
    data: submissions,
  });
});

export const submissionController = {
  createReviewedSubmission,
  gradeSubmission,
  getMyCourseTotal,
  getMySubmissionsByUnit,
  getMyTaskSubmission,
  getSubmissionsForReview,
  reviewSubmission,
  getSubmissionsByUnit,
  getMyAllSubmissions
};
