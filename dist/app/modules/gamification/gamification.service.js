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
exports.GamificationServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const gamification_model_1 = require("./gamification.model");
const mongoose_1 = require("mongoose");
const addPoints = (input) => __awaiter(void 0, void 0, void 0, function* () {
    if (input.points <= 0)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "points must be > 0");
    // 1) Write log (immutable)
    yield gamification_model_1.PointLog.create({
        user: new mongoose_1.Types.ObjectId(input.userId),
        points: input.points,
        sourceType: input.sourceType,
        course: input.courseId ? new mongoose_1.Types.ObjectId(input.courseId) : undefined,
        event: input.eventId ? new mongoose_1.Types.ObjectId(input.eventId) : undefined,
        task: input.taskId ? new mongoose_1.Types.ObjectId(input.taskId) : undefined,
        reason: input.reason
    });
    // 2) Upsert wallet
    const wallet = yield gamification_model_1.PointWallet.findOneAndUpdate({ user: input.userId }, {
        $inc: Object.assign({ totalPoints: input.points }, (input.courseId ? { [`byCourse.${input.courseId}`]: input.points } : {}))
    }, { new: true, upsert: true });
    return wallet;
});
const getMyPoints = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield gamification_model_1.PointWallet.findOne({ user: userId });
    const logs = yield gamification_model_1.PointLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    return { wallet: wallet !== null && wallet !== void 0 ? wallet : { totalPoints: 0, byCourse: {} }, logs };
});
const getLeaderboard = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 20, scope = "global", filterValue, // e.g., "Malaysia" or "Edufest University"
courseId) {
    let sortField = "totalPoints";
    const match = {};
    const addFields = {};
    if (courseId) {
        addFields.coursePoints = { $ifNull: [`$byCourse.${courseId}`, 0] };
        sortField = "coursePoints";
    }
    // Build pipeline
    const pipeline = [];
    if (Object.keys(addFields).length) {
        pipeline.push({ $addFields: addFields });
    }
    // Join user info
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
        },
    });
    pipeline.push({ $unwind: "$user" });
    // Apply scope filter
    if (scope === "region" && filterValue) {
        pipeline.push({ $match: { "user.region": filterValue } });
    }
    if (scope === "school" && filterValue) {
        pipeline.push({ $match: { "user.organization": filterValue } });
    }
    // Sort and limit
    pipeline.push({ $sort: { [sortField]: -1, updatedAt: -1 } });
    pipeline.push({ $limit: limit });
    // Project final leaderboard
    pipeline.push({
        $project: {
            _id: 0,
            userId: "$user._id",
            name: "$user.name",
            email: "$user.email",
            region: "$user.region",
            organization: "$user.organization",
            totalPoints: 1,
            [sortField]: 1,
            updatedAt: 1,
        },
    });
    const result = yield gamification_model_1.PointWallet.aggregate(pipeline);
    return result;
});
exports.GamificationServices = { addPoints, getMyPoints, getLeaderboard };
