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
const listAll = () => __awaiter(void 0, void 0, void 0, function* () {
    return badge_model_1.Badge.find({ isActive: true }).sort({ createdAt: -1 });
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
    return badge_model_1.UserBadge.find({ user: userId }).populate("badge").sort({ issuedAt: -1 });
});
/** helper: auto-issue by course/event **/
const autoIssueBadge = (context) => __awaiter(void 0, void 0, void 0, function* () {
    let badge;
    if (context.courseId)
        badge = yield badge_model_1.Badge.findOne({ courseId: context.courseId, type: "course", isActive: true });
    else if (context.eventId)
        badge = yield badge_model_1.Badge.findOne({ eventId: context.eventId, type: "event", isActive: true });
    if (badge) {
        yield issueBadge(context.userId, String(badge._id), "Auto-issued for completion");
    }
});
exports.BadgeServices = {
    create,
    update,
    remove,
    listAll,
    issueBadge,
    listUserBadges,
    autoIssueBadge,
};
