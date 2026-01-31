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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const badge_service_1 = require("./badge.service");
const gamification_model_1 = require("../gamification/gamification.model");
const enrollment_model_1 = require("../enrollment/enrollment.model");
const create = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_service_1.BadgeServices.create(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Badge created successfully",
        data: badge,
    });
}));
const update = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_service_1.BadgeServices.update(req.params.badgeId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Badge updated successfully",
        data: badge,
    });
}));
const remove = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_service_1.BadgeServices.remove(req.params.badgeId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Badge deleted successfully",
        data: badge,
    });
}));
const listAll = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract query parameters for pagination and search
    const _a = req.query, { q = "", page = "1", limit = "10", sortBy = "createdAt", sortOrder = "desc" } = _a, filters = __rest(_a, ["q", "page", "limit", "sortBy", "sortOrder"]);
    const result = yield badge_service_1.BadgeServices.listAll(Object.assign({ q: q, page: parseInt(page), limit: parseInt(limit), sortBy: sortBy, sortOrder: sortOrder }, filters));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Badges retrieved successfully",
        data: result,
    });
}));
const issue = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_service_1.BadgeServices.issueBadge(req.body.userId, req.body.badgeId, req.body.reason);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Badge issued successfully",
        data: badge,
    });
}));
const myBadges = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const me = req.user;
    const badges = yield badge_service_1.BadgeServices.listUserBadges(me.userId);
    const totalPoints = yield gamification_model_1.PointWallet.findOne({
        user: me.userId
    });
    const totalCourse = yield enrollment_model_1.Enrollment.countDocuments({ user: me.userId });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "User badges retrieved successfully",
        data: {
            badges,
            totalPoints: totalPoints === null || totalPoints === void 0 ? void 0 : totalPoints.totalPoints,
            totalCourse
        },
    });
}));
// New controller for getting a single badge
const getById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_service_1.BadgeServices.getById(req.params.badgeId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Badge retrieved successfully",
        data: badge,
    });
}));
// New controller for toggling badge status
const toggleStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_service_1.BadgeServices.toggleStatus(req.params.badgeId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `Badge ${badge.isActive ? 'activated' : 'deactivated'} successfully`,
        data: badge,
    });
}));
exports.badgeController = {
    create,
    update,
    remove,
    listAll,
    issue,
    myBadges,
    getById,
    toggleStatus
};
