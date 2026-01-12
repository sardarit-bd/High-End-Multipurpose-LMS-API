"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSubmission = void 0;
const mongoose_1 = require("mongoose");
const SubmissionSchema = new mongoose_1.Schema({
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    unit: { type: mongoose_1.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quiz: { type: mongoose_1.Schema.Types.ObjectId, ref: "Quiz" },
    type: { type: String, enum: ["quiz", "task"], required: true },
    instructor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    artifactUrl: { type: String },
    note: { type: String },
    quizAttemptId: { type: mongoose_1.Schema.Types.ObjectId, ref: "QuizAttempt" },
    correctAnswers: { type: Number },
    pointsAwarded: { type: Number, required: true, default: 0 },
    breakdown: { type: Array }, // per-question breakdown for quizzes
    status: { type: String, enum: ["auto_scored", "pending_review", "reviewed"], required: true, default: "pending_review" },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" }, // instructor who reviewed
    reviewedAt: { type: Date }, // review timestamp
    reviewNote: { type: String }, // instructor feedback/comments
}, { timestamps: true, versionKey: false });
SubmissionSchema.index({ course: 1, user: 1 });
exports.TaskSubmission = mongoose_1.models.TaskSubmission || (0, mongoose_1.model)("TaskSubmission", SubmissionSchema);
