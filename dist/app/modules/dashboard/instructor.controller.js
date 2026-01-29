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
exports.getDashboard = exports.getEarningsData = exports.getPendingTasks = exports.getRecentTaskSubmissions = exports.getTopPerformingCourses = exports.getStats = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const instructor_services_1 = require("./instructor.services");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
exports.getStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const instructorId = user.userId;
    const stats = yield (0, instructor_services_1.getInstructorStats)(instructorId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Instructor statistics retrieved successfully",
        data: stats
    });
}));
exports.getTopPerformingCourses = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const instructorId = user.userId;
    const limit = parseInt(req.query.limit) || 5;
    const topCourses = yield (0, instructor_services_1.getTopCourses)(instructorId, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Top courses retrieved successfully",
        data: topCourses
    });
}));
exports.getRecentTaskSubmissions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const instructorId = user.userId;
    const limit = parseInt(req.query.limit) || 10;
    const submissions = yield (0, instructor_services_1.getRecentSubmissions)(instructorId, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Recent submissions retrieved successfully",
        data: submissions
    });
}));
exports.getPendingTasks = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const instructorId = user.userId;
    const tasks = yield (0, instructor_services_1.getUnevaluatedTasks)(instructorId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Unevaluated tasks retrieved successfully",
        data: tasks
    });
}));
exports.getEarningsData = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const instructorId = user.userId;
    const months = parseInt(req.query.months) || 12;
    const earnings = yield (0, instructor_services_1.getMonthlyEarnings)(instructorId, months);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Monthly earnings retrieved successfully",
        data: earnings
    });
}));
exports.getDashboard = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const instructorId = user.userId;
    const dashboard = yield (0, instructor_services_1.getInstructorDashboard)(instructorId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashboard
    });
}));
