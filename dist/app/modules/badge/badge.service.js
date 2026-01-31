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
exports.BadgeServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const badge_model_1 = require("./badge.model");
const create = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_model_1.Badge.create(payload);
    return badge;
});
const update = (badgeId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_model_1.Badge.findByIdAndUpdate(badgeId, payload, { new: true });
    if (!badge)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Badge not found");
    return badge;
});
const remove = (badgeId) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_model_1.Badge.findByIdAndDelete(badgeId);
    if (!badge)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Badge not found");
    return badge;
});
const listAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q = "", page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", isActive } = query, otherFilters = __rest(query, ["q", "page", "limit", "sortBy", "sortOrder", "isActive"]);
    // Build search query
    const searchQuery = {};
    // Search in title and description
    if (q && q.trim()) {
        searchQuery.$or = [
            { title: { $regex: q.trim(), $options: "i" } },
            { description: { $regex: q.trim(), $options: "i" } },
        ];
    }
    // Filter by isActive status if provided
    if (isActive !== undefined && isActive !== "") {
        searchQuery.isActive = isActive === "true" || isActive === true;
    }
    // Apply other filters
    Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key] !== undefined && otherFilters[key] !== "") {
            searchQuery[key] = otherFilters[key];
        }
    });
    // Convert page and limit to numbers
    const pageNumber = parseInt(String(page), 10) || 1;
    const limitNumber = parseInt(String(limit), 10) || 10;
    // Ensure valid values
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.max(1, Math.min(limitNumber, 100)); // Max limit 100
    // Calculate pagination
    const skip = (validPage - 1) * validLimit;
    // Get total count
    const total = yield badge_model_1.Badge.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / validLimit);
    // Validate page number
    if (validPage > totalPages && total > 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Page number exceeds total pages");
    }
    // Determine sort order
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;
    // Fetch badges with pagination and sorting
    const badges = yield badge_model_1.Badge.find(searchQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(validLimit)
        .lean();
    return {
        data: badges,
        meta: {
            page: validPage,
            limit: validLimit,
            total,
            totalPages,
        },
    };
});
const getById = (badgeId) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_model_1.Badge.findById(badgeId);
    if (!badge)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Badge not found");
    return badge;
});
const toggleStatus = (badgeId) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_model_1.Badge.findById(badgeId);
    if (!badge)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Badge not found");
    badge.isActive = !badge.isActive;
    yield badge.save();
    return badge;
});
const issueBadge = (userId, badgeId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const badge = yield badge_model_1.Badge.findById(badgeId);
    if (!badge || !badge.isActive)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Badge not found");
    const existing = yield badge_model_1.UserBadge.findOne({ user: userId, badge: badgeId });
    if (existing)
        return existing;
    const ub = yield badge_model_1.UserBadge.create({
        user: userId,
        badge: badgeId,
        reason,
    });
    return ub;
});
const listUserBadges = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return badge_model_1.UserBadge.find({ user: userId })
        .populate("badge")
        .sort({ issuedAt: -1 })
        .populate('');
});
/** helper: auto-issue by course/event **/
const autoIssueBadge = (context) => __awaiter(void 0, void 0, void 0, function* () {
    // let badge;
    // if (context.courseId)
    //   badge = await Badge.findOne({ courseId: context.courseId, type: "course", isActive: true });
    // else if (context.eventId)
    //   badge = await Badge.findOne({ eventId: context.eventId, type: "event", isActive: true });
    const badge = yield getBadgeByPoints(context.totalPoints);
    if (badge) {
        yield issueBadge(context.userId, String(badge === null || badge === void 0 ? void 0 : badge._id), "Auto-issued for completion");
    }
});
const getBadgeByPoints = (studentPoints) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("total points", studentPoints);
    const badge = yield badge_model_1.Badge.findOne({
        isActive: true,
        pointsRequired: { $lte: studentPoints }
    })
        .sort({ pointsRequired: -1 })
        .lean();
    return badge;
});
exports.BadgeServices = {
    create,
    update,
    remove,
    listAll,
    getById,
    toggleStatus,
    issueBadge,
    listUserBadges,
    autoIssueBadge,
    getBadgeByPoints
};
