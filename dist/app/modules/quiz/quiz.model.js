"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quiz = void 0;
const mongoose_1 = require("mongoose");
const OptionSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false },
}, { _id: false });
const QuestionSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["mcq", 'short'], required: true },
    prompt: { type: String, required: true },
    options: { type: [OptionSchema] },
    perCorrectPoint: { type: Number }, // points for correct answer (MCQ) or max points (Short)
}, { _id: false });
const QuizSchema = new mongoose_1.Schema({
    unit: { type: mongoose_1.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    task: { type: mongoose_1.Schema.Types.ObjectId, ref: "Task", index: true }, // 1-1 with Task(type=quiz)
    title: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
    passMark: { type: Number, default: 50 }, // passing percentage
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
QuizSchema.index({ unit: 1, createdAt: 1 });
exports.Quiz = mongoose_1.models.Quiz || (0, mongoose_1.model)("Quiz", QuizSchema);
