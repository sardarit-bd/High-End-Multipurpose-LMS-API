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
exports.DashboardController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const dashboard_services_1 = require("./dashboard.services");
const getInstructorDashboard = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const dashboardData = yield dashboard_services_1.DashboardServices.getInstructorDashboard(token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Instructor dashboard data fetched successfully",
        data: dashboardData,
    });
}));
const getInstructorStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const stats = yield dashboard_services_1.DashboardServices.getInstructorStats(token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Instructor stats fetched successfully",
        data: stats,
    });
}));
const getEarningsChart = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const earningsData = yield dashboard_services_1.DashboardServices.getEarningsChart(token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Earnings chart data fetched successfully",
        data: earningsData,
    });
}));
const getCourseStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const instructorId = req.params.instructorId;
    const stats = yield dashboard_services_1.DashboardServices.getCourseStats(instructorId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Course stats fetched successfully",
        data: stats,
    });
}));
const getStudentDashboard = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const dashboardData = yield dashboard_services_1.DashboardServices.getStudentDashboard(token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Student dashboard data fetched successfully",
        data: dashboardData,
    });
}));
const getAdminStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const stats = yield dashboard_services_1.DashboardServices.getAdminStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Admin stats fetched successfully",
        data: stats,
    });
}));
exports.DashboardController = {
    getInstructorDashboard,
    getInstructorStats,
    getEarningsChart,
    getCourseStats,
    getStudentDashboard,
    getAdminStats
};
