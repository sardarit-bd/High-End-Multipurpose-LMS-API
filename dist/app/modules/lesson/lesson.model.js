"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletedLesson = exports.Lesson = void 0;
const mongoose_1 = require("mongoose");
const LessonSchema = new mongoose_1.Schema({
    unit: { type: mongoose_1.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    // course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true },
    contentType: {
        type: String,
        enum: ["video", "article", "pdf", "audio", "link"],
        required: true,
    },
    contentUrl: { type: String, required: true },
    durationSec: { type: Number },
    orderIndex: { type: Number, required: true, default: 1 },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
LessonSchema.index({ unit: 1, orderIndex: 1 });
exports.Lesson = mongoose_1.models.Lesson || (0, mongoose_1.model)("Lesson", LessonSchema);
const CompletedLessonSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: mongoose_1.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    completedAt: { type: Date, default: Date.now }
}, { versionKey: false });
CompletedLessonSchema.index({ user: 1, lesson: 1 }, { unique: true });
exports.CompletedLesson = mongoose_1.models.CompletedLesson || (0, mongoose_1.model)("CompletedLesson", CompletedLessonSchema);
