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
exports.TaskServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const task_model_1 = require("./task.model");
const unit_model_1 = require("../unit/unit.model");
const course_model_1 = require("../course/course.model");
const quiz_model_1 = require("../quiz/quiz.model");
const create = (unitId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const unit = yield unit_model_1.Unit.findById(unitId);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    const course = yield course_model_1.Course.findById(unit.course);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Create the task first
    const doc = yield task_model_1.Task.create({
        unit: unit._id,
        course: course._id,
        title: payload.title,
        type: payload.type,
        description: payload.description,
        maxPoints: payload.maxPoints,
        quizId: payload.quizId,
        dueDate: payload.dueDate
    });
    // If task type is "quiz", automatically create a quiz document
    if (payload.type === "quiz") {
        const quiz = yield quiz_model_1.Quiz.create({
            unit: unit._id,
            course: course._id,
            task: doc._id,
            title: payload.title,
            questions: [], // Empty initially
        });
        // Update task with quizId reference
        doc.quizId = quiz._id;
        yield doc.save();
    }
    return doc;
});
const listByUnit = (unitId) => __awaiter(void 0, void 0, void 0, function* () {
    const unit = yield unit_model_1.Unit.findById(unitId);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    return task_model_1.Task.find({ unit: unitId, isDeleted: false }).sort({ createdAt: 1 }).populate('quizId');
});
const update = (taskId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_model_1.Task.findById(taskId);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    const course = yield course_model_1.Course.findById(task.course);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Store original type to check if it's changing
    const originalType = task.type;
    const newType = payload.type !== undefined ? payload.type : task.type;
    // Handle type change: if changing FROM quiz TO something else, delete the quiz
    if (originalType === "quiz" && newType !== "quiz" && task.quizId) {
        const quiz = yield quiz_model_1.Quiz.findById(task.quizId);
        if (quiz && !quiz.isDeleted) {
            quiz.isDeleted = true;
            yield quiz.save();
        }
        task.quizId = null; // Clear quizId reference
    }
    // Handle type change: if changing TO quiz, create a quiz if it doesn't exist
    if (originalType !== "quiz" && newType === "quiz" && !task.quizId) {
        const quiz = yield quiz_model_1.Quiz.create({
            unit: task.unit,
            course: task.course,
            task: task._id,
            title: payload.title || task.title,
            questions: [], // Empty initially
        });
        task.quizId = quiz._id;
    }
    // If type is quiz and title is being updated, update quiz title too
    if (newType === "quiz" && payload.title !== undefined && task.quizId) {
        const quiz = yield quiz_model_1.Quiz.findById(task.quizId);
        if (quiz && !quiz.isDeleted) {
            quiz.title = payload.title;
            yield quiz.save();
        }
    }
    // Update task fields
    if (payload.title !== undefined)
        task.title = payload.title;
    if (payload.description !== undefined)
        task.description = payload.description;
    if (payload.type !== undefined)
        task.type = payload.type;
    if (payload.dueDate !== undefined)
        task.dueDate = payload.dueDate;
    if (payload.maxPoints !== undefined)
        task.maxPoints = payload.maxPoints;
    yield task.save();
    return yield task.populate('quizId');
});
const remove = (taskId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_model_1.Task.findById(taskId);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    const course = yield course_model_1.Course.findById(task.course);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // If task type is quiz, also delete the associated quiz
    if (task.type === "quiz" && task.quizId) {
        const quiz = yield quiz_model_1.Quiz.findById(task.quizId);
        if (quiz && !quiz.isDeleted) {
            quiz.isDeleted = true;
            yield quiz.save();
        }
    }
    // Soft delete task
    task.isDeleted = true;
    yield task.save();
    return task;
});
exports.TaskServices = { create, listByUnit, update, remove };
