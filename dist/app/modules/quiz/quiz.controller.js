"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const quiz_services_1 = require("./quiz.services");
const createQuiz = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { unitId } = req.body;
    const created = yield quiz_services_1.QuizServices.createQuiz(unitId, req.body, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Quiz shell created successfully",
        data: created,
    });
}));
const addQuestion = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { quizId } = req.body;
    const updated = yield quiz_services_1.QuizServices.addQuestionToQuiz(quizId, {
        userId: token.userId,
        role: token.role,
    }, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Question added successfully",
        data: updated,
    });
}));
const getQuizQuestions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { quizId } = req.params;
    const data = yield quiz_services_1.QuizServices.getQuizQuestions(quizId, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Quiz questions retrieved successfully",
        data,
    });
}));
const updateQuestion = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { questionId } = req.params;
    const { quizId } = req.body;
    const updated = yield quiz_services_1.QuizServices.updateQuestionToQuiz(quizId, questionId, {
        userId: token.userId,
        role: token.role,
    }, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Question updated successfully",
        data: updated,
    });
}));
const deleteQuestion = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { questionId } = req.params;
    const result = yield quiz_services_1.QuizServices.deleteQuestionFromQuiz(questionId, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Question deleted successfully",
        data: result,
    });
}));
const listQuizzes = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const items = yield quiz_services_1.QuizServices.listByUnit(taskId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Quizzes fetched",
        data: items,
    });
}));
/**
 * Student submits quiz:
 * Body supports legacy `number[][]` OR mixed:
 * { answers: [{ type:"mcq", selected:number[] } | { type:"short", text:string }] }
 */
const submitQuiz = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { quizId } = req.body;
    const result = yield quiz_services_1.QuizServices.submitQuiz(quizId, token.userId, req.body.answers);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: result.needsReview ? "Quiz submitted (pending review for short answers)" : "Quiz submitted",
        data: result,
    });
}));
const fixExistingQuizTasks = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_services_1.QuizServices.fixExistingQuizTasks();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Quiz tasks fixed successfully",
        data: result,
    });
}));
exports.quizController = { createQuiz, listQuizzes, submitQuiz, addQuestion, getQuizQuestions, updateQuestion, deleteQuestion, fixExistingQuizTasks };
