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
exports.LessonServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const unit_model_1 = require("../unit/unit.model");
const course_model_1 = require("../course/course.model");
const lesson_model_1 = require("./lesson.model");
const createLesson = (payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Verify unit and course
    const { unit: unitId } = payload;
    const unit = yield unit_model_1.Unit.findById(unitId);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    const course = yield course_model_1.Course.findById(unit.course);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    // Owner or admin
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    const doc = yield lesson_model_1.Lesson.create({
        unit: unit._id,
        course: course._id,
        title: payload.title,
        contentType: payload.contentType,
        contentUrl: payload.contentUrl,
        orderIndex: (_a = payload.orderIndex) !== null && _a !== void 0 ? _a : 1,
        durationSec: payload.durationSec,
    });
    return doc;
});
const listLessons = (unitId) => __awaiter(void 0, void 0, void 0, function* () {
    // Optional: verify unit existence for a clear 404
    const unit = yield unit_model_1.Unit.findById(unitId);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    return lesson_model_1.Lesson.find({ unit: unitId, isDeleted: false }).sort({ orderIndex: 1, createdAt: 1 });
});
const resolveCourseFromLesson = (lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const lesson = yield lesson_model_1.Lesson.findById(lessonId).populate("unit"); // unit.course in your schema
    if (!lesson)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Lesson Not Found");
    const courseId = lesson.course || ((_a = lesson.unit) === null || _a === void 0 ? void 0 : _a.course); // depending on your denormalization
    if (!courseId)
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Lesson missing course reference");
    return { courseId: String(courseId) };
});
const markCompleted = (userId, courseId, lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    yield lesson_model_1.CompletedLesson.updateOne({ user: userId, lesson: lessonId }, { $setOnInsert: { course: courseId, completedAt: new Date() } }, { upsert: true });
});
const updateLesson = (lessonId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const lesson = yield lesson_model_1.Lesson.findById(lessonId);
    if (!lesson || lesson.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Lesson Not Found");
    const unit = yield unit_model_1.Unit.findById(lesson.unit);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    const course = yield course_model_1.Course.findById(unit.course);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    const updated = yield lesson_model_1.Lesson.findByIdAndUpdate(lessonId, Object.assign(Object.assign({}, payload), { updatedAt: new Date() }), { new: true });
    return updated;
});
exports.LessonServices = { createLesson, listLessons, resolveCourseFromLesson, markCompleted, updateLesson };
