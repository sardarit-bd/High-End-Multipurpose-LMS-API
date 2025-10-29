/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { QuizServices } from "./quiz.services";

const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { unitId } = req.body;

  const created = await QuizServices.createQuiz(unitId, req.body, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Quiz shell created successfully",
    data: created,
  });
});

const addQuestion = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { quizId } = req.body;

  const updated = await QuizServices.addQuestionToQuiz(quizId, {
    userId: token.userId,
    role: token.role,
  }, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Question added successfully",
    data: updated,
  });
});

const getQuizQuestions = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { quizId } = req.params;

  const data = await QuizServices.getQuizQuestions(quizId, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz questions retrieved successfully",
    data,
  });
});



const listQuizzes = catchAsync(async (req: Request, res: Response) => {
  const { unitId } = req.params;
  const items = await QuizServices.listByUnit(unitId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quizzes fetched",
    data: items,
  });
});

/**
 * Student submits quiz:
 * Body supports legacy `number[][]` OR mixed:
 * { answers: [{ type:"mcq", selected:number[] } | { type:"short", text:string }] }
 */
const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { quizId } = req.body;

  const result = await QuizServices.submitQuiz(quizId, token.userId, req.body.answers);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.needsReview ? "Quiz submitted (pending review for short answers)" : "Quiz submitted",
    data: result,
  });
});

export const quizController = { createQuiz, listQuizzes, submitQuiz, addQuestion, getQuizQuestions};
