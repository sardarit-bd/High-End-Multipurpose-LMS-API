"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    unit: { type: mongoose_1.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["quiz", "video", "pdf"], required: true },
    maxPoints: { type: Number }, // cap for video/pdf types
    dueDate: { type: Date },
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Quiz" }, // when type === "quiz"
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
TaskSchema.index({ unit: 1, createdAt: 1 });
exports.Task = mongoose_1.models.Task || (0, mongoose_1.model)("Task", TaskSchema);
