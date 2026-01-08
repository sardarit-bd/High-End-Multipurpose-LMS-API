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
exports.lessonController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const lesson_services_1 = require("./lesson.services");
const createLesson = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user; // expects { userId, role }
    const created = yield lesson_services_1.LessonServices.createLesson(req.body, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Lesson Created Successfully",
        data: created,
    });
}));
const listLessons = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { unitId } = req.params;
    const items = yield lesson_services_1.LessonServices.listLessons(unitId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Lessons fetched",
        data: items,
    });
}));
const completeLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { lessonId } = req.body;
    const { courseId } = yield lesson_services_1.LessonServices.resolveCourseFromLesson(lessonId);
    yield lesson_services_1.LessonServices.markCompleted(token.userId, courseId, lessonId);
    // NOTE: Points for quiz correctness & attendance will be added in their own endpoints.
    // We keep lesson completion lean here (no auto points).
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Lesson marked as completed",
        data: { courseId, lessonId }
    });
}));
const updateLesson = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { lessonId } = req.params;
    const updated = yield lesson_services_1.LessonServices.updateLesson(lessonId, req.body, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Lesson Updated Successfully",
        data: updated,
    });
}));
exports.lessonController = { createLesson, listLessons, completeLesson, updateLesson };
