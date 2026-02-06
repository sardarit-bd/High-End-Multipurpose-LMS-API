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
exports.gamificationController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const gamification_service_1 = require("./gamification.service");
const getMyPoints = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const me = req.user;
    const data = yield gamification_service_1.GamificationServices.getMyPoints(me.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My points",
        data
    });
}));
const getLeaderboard = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, scope, value, courseId, schoolId, cityId } = req.query;
    const data = yield gamification_service_1.GamificationServices.getLeaderboard({
        limit: Number(limit) || 20,
        scope: scope || "global",
        value: value,
        courseId: courseId,
        schoolId: schoolId,
        cityId: cityId
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Leaderboard fetched successfully",
        data,
    });
}));
const getSchoolsLeaderboard = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, schoolId } = req.query;
    const data = yield gamification_service_1.GamificationServices.getSchoolsLeaderboard(Number(limit) || 20, schoolId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Schools leaderboard fetched successfully",
        data,
    });
}));
const getCitiesLeaderboard = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, cityId } = req.query;
    const data = yield gamification_service_1.GamificationServices.getCitiesLeaderboard(Number(limit) || 20, cityId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cities leaderboard fetched successfully",
        data,
    });
}));
const getMyRank = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const me = req.user;
    const { scope, scopeId, courseId } = req.query;
    const data = yield gamification_service_1.GamificationServices.getStudentRank(me.userId, scope || "global", scopeId, courseId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Rank fetched successfully",
        data,
    });
}));
// optional: admin/instructor manual award
const award = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body; // { userId, points, sourceType, reason, courseId, eventId, taskId }
    const wallet = yield gamification_service_1.GamificationServices.addPoints(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Points awarded",
        data: wallet
    });
}));
exports.gamificationController = {
    getMyPoints,
    getLeaderboard,
    getSchoolsLeaderboard,
    getCitiesLeaderboard,
    getMyRank,
    award
};
