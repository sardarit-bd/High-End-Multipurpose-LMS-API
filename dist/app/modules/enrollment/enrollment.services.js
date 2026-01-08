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
exports.EnrollmentServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const enrollment_model_1 = require("./enrollment.model");
const course_model_1 = require("../course/course.model");
const badge_service_1 = require("../badge/badge.service");
const ensureCourse = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    return course;
});
// Idempotent self-enroll (used by payment success)
const enrollSelf = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureCourse(courseId);
    const existing = yield enrollment_model_1.Enrollment.findOne({ course: courseId, user: userId });
    if (existing)
        return existing;
    const now = new Date();
    return enrollment_model_1.Enrollment.create({
        course: courseId, user: userId, status: "enrolled",
        progress: 0, startedAt: now, lastActivityAt: now
    });
});
const getMyEnrollment = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureCourse(courseId);
    const doc = yield enrollment_model_1.Enrollment.findOne({ course: courseId, user: userId, isDeleted: false });
    if (!doc)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Enrollment Not Found");
    return doc;
});
const listMyEnrollments = (userId) => __awaiter(void 0, void 0, void 0, function* () { return enrollment_model_1.Enrollment.find({ user: userId, isDeleted: false }).populate("course").sort({ updatedAt: -1 }); });
const listCourseEnrollments = (courseId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield ensureCourse(courseId);
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return enrollment_model_1.Enrollment.find({ course: courseId, isDeleted: false }).populate("user").sort({ createdAt: -1 });
});
const updateStatus = (courseId, enrollmentId, actor, status) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield ensureCourse(courseId);
    const enrollment = yield enrollment_model_1.Enrollment.findOne({
        _id: enrollmentId,
        course: courseId,
        isDeleted: false
    });
    if (!enrollment)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Enrollment Not Found");
    const isSelf = String(enrollment.user) === String(actor.userId);
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!(isSelf || isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    enrollment.status = status;
    if (status === "completed") {
        enrollment.completedAt = new Date();
        enrollment.progress = 100;
        yield badge_service_1.BadgeServices.autoIssueBadge({
            userId: String(enrollment.user),
            courseId: String(courseId)
        });
    }
    enrollment.lastActivityAt = new Date();
    yield enrollment.save();
    return enrollment;
});
const updateProgress = (courseId, enrollmentId, actor, progress) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield ensureCourse(courseId);
    const enrollment = yield enrollment_model_1.Enrollment.findOne({ _id: enrollmentId, course: courseId, isDeleted: false });
    if (!enrollment)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Enrollment Not Found");
    const isSelf = String(enrollment.user) === String(actor.userId);
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!(isSelf || isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    enrollment.progress = progress;
    if (progress >= 100 && enrollment.status !== "completed") {
        enrollment.status = "completed";
        enrollment.completedAt = new Date();
    }
    enrollment.lastActivityAt = new Date();
    yield enrollment.save();
    return enrollment;
});
exports.EnrollmentServices = {
    enrollSelf, getMyEnrollment, listMyEnrollments, listCourseEnrollments, updateStatus, updateProgress,
};
