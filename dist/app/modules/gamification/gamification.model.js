"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointWallet = exports.PointLog = void 0;
const mongoose_1 = require("mongoose");
const PointLogSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    points: { type: Number, required: true },
    sourceType: { type: String, enum: ["event", "quiz", "task", "manual", "package", "course", "purchase", "enrollment", "lesson"], required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course" },
    event: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event" },
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: "Task" },
    lesson: { type: mongoose_1.Schema.Types.ObjectId, ref: "Lesson" },
    reason: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
PointLogSchema.index({ user: 1, createdAt: -1 });
const PointWalletSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    totalPoints: { type: Number, default: 0 },
    byCourse: { type: mongoose_1.Schema.Types.Mixed, default: {} }
}, { timestamps: true, versionKey: false });
exports.PointLog = mongoose_1.models.PointLog || (0, mongoose_1.model)("PointLog", PointLogSchema);
exports.PointWallet = mongoose_1.models.PointWallet || (0, mongoose_1.model)("PointWallet", PointWalletSchema);
