"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const mongoose_1 = __importDefault(require("mongoose"));
const ensureCourse = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    return course;
});
// Idempotent self-enroll (used by payment success)
const enrollSelf = (courseId, userId, instructor) => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureCourse(courseId);
    const existing = yield enrollment_model_1.Enrollment.findOne({ course: courseId, user: userId });
    if (existing)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You Enrolled Before");
    const now = new Date();
    const res = yield enrollment_model_1.Enrollment.create({
        course: courseId, user: userId, status: "enrolled", instructor: instructor,
        progress: 0, startedAt: now, lastActivityAt: now
    });
    return res;
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
const updateStatus = (actor, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, enrollmentId, status, totalPoints } = payload;
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
        // Get total points earned in this course
        // const { TaskSubmission } = await import("../submission/submission.model");
        // const totalPointsResult = await TaskSubmission.aggregate([
        //   { $match: { course: courseId, user: enrollment.user } },
        //   { $group: { _id: null, totalPoints: { $sum: "$pointsAwarded" } } }
        // ]);
        // const totalPoints = totalPointsResult[0]?.totalPoints || 0;
        // console.log(`🎓 Course completed! User ${enrollment.user} earned ${totalPoints} points in course ${courseId}`);
        yield badge_service_1.BadgeServices.autoIssueBadge({
            totalPoints: totalPoints,
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
// Comprehensive progress calculation including lessons, tasks, and quizzes
const calculateComprehensiveProgress = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const course = yield ensureCourse(courseId);
    const units = yield Promise.resolve().then(() => __importStar(require("../unit/unit.model"))).then(mod => mod.Unit.find({ course: courseId, isDeleted: false }));
    // Get total lessons count
    const { Lesson } = yield Promise.resolve().then(() => __importStar(require("../lesson/lesson.model")));
    const totalLessons = yield Lesson.countDocuments({
        unit: { $in: units.map(u => u._id) },
        isDeleted: false
    });
    // Get total tasks count (excluding quizzes since they're handled separately)
    const { Task } = yield Promise.resolve().then(() => __importStar(require("../task/task.model")));
    const totalTasks = yield Task.countDocuments({
        unit: { $in: units.map(u => u._id) },
        type: { $nin: ["quiz"] },
        isDeleted: false
    });
    // Get total quizzes count
    const totalQuizzes = yield Task.countDocuments({
        unit: { $in: units.map(u => u._id) },
        type: "quiz",
        isDeleted: false
    });
    // Get enrollment data
    const enrollment = yield enrollment_model_1.Enrollment.findOne({
        course: courseId,
        user: userId,
        isDeleted: false
    });
    console.log("enrollment", enrollment);
    const completedLessons = ((_a = enrollment === null || enrollment === void 0 ? void 0 : enrollment.completedLessons) === null || _a === void 0 ? void 0 : _a.length) || 0;
    // Get submitted tasks count (excluding quizzes)
    const { TaskSubmission } = yield Promise.resolve().then(() => __importStar(require("../submission/submission.model")));
    const submittedTasks = yield TaskSubmission.countDocuments({
        course: courseId,
        user: userId,
        type: "task",
        status: { $in: ["approved", "auto_scored", "pending_review"] }
    });
    // Get submitted quizzes count
    const submittedQuizzes = yield TaskSubmission.countDocuments({
        course: courseId,
        user: userId,
        type: "quiz",
        status: { $in: ["approved", "auto_scored", "pending_review"] }
    });
    // Calculate total items and completed items
    console.log("totalLessons", totalLessons, "completedLessons", completedLessons);
    console.log("totalTasks", totalTasks, "submittedTasks", submittedTasks);
    console.log("totalQuizzes", totalQuizzes, "submittedQuizzes", submittedQuizzes);
    const totalItems = totalLessons + totalTasks + totalQuizzes;
    const completedItems = completedLessons + submittedTasks + submittedQuizzes;
    // Calculate progress percentage
    const progress = totalItems > 0
        ? Math.min(100, Math.round((completedItems / totalItems) * 100))
        : 0;
    return {
        progress,
        breakdown: {
            lessons: { completed: completedLessons, total: totalLessons },
            tasks: { completed: submittedTasks, total: totalTasks },
            quizzes: { completed: submittedQuizzes, total: totalQuizzes }
        },
        totalItems,
        completedItems
    };
});
const completeLesson = (courseId, enrollmentId, actor, lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const course = yield ensureCourse(courseId);
    const enrollment = yield enrollment_model_1.Enrollment.findOne({ _id: enrollmentId, course: courseId, isDeleted: false });
    if (!enrollment)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Enrollment Not Found");
    const isSelf = String(enrollment.user) === String(actor.userId);
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!(isSelf || isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Check if lesson was already completed to avoid duplicate points
    const wasAlreadyCompleted = (_a = enrollment.completedLessons) === null || _a === void 0 ? void 0 : _a.includes(lessonId);
    // Add lesson to completed lessons if not already there
    if (!wasAlreadyCompleted) {
        enrollment.completedLessons = enrollment.completedLessons || [];
        enrollment.completedLessons.push(lessonId);
        yield enrollment.save();
        // Award points for completing lesson
        const { GamificationServices } = yield Promise.resolve().then(() => __importStar(require("../gamification/gamification.service")));
        yield GamificationServices.addPoints({
            userId: String(enrollment.user),
            points: 10, // Default points for lesson completion
            sourceType: "lesson",
            courseId: courseId,
            lessonId: lessonId,
            reason: "Lesson completion"
        });
    }
    // Calculate comprehensive progress including lessons, tasks, and quizzes
    const progressData = yield calculateComprehensiveProgress(courseId, String(enrollment.user));
    enrollment.progress = progressData.progress;
    enrollment.lastActivityAt = new Date();
    yield enrollment.save();
    return enrollment;
});
const updateTimeSpent = (courseId, enrollmentId, actor, timeSpent) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield ensureCourse(courseId);
    const enrollment = yield enrollment_model_1.Enrollment.findOne({ _id: enrollmentId, course: courseId, isDeleted: false });
    if (!enrollment)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Enrollment Not Found");
    const isSelf = String(enrollment.user) === String(actor.userId);
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!(isSelf || isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    enrollment.timeSpent = (enrollment.timeSpent || 0) + timeSpent;
    enrollment.lastActivityAt = new Date();
    yield enrollment.save();
    return enrollment;
});
// Get total points earned by user in a course
const getUserCoursePoints = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { PointLog } = yield Promise.resolve().then(() => __importStar(require("../gamification/gamification.model")));
    const { Types } = yield Promise.resolve().then(() => __importStar(require("mongoose")));
    const result = yield PointLog.aggregate([
        { $match: { course: new Types.ObjectId(courseId), user: new Types.ObjectId(userId) } },
        { $group: { _id: null, totalPoints: { $sum: "$points" } } }
    ]);
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalPoints) || 0;
});
const getEnrolledStudentsByInstructor = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    const studentsWithPoints = yield enrollment_model_1.Enrollment.aggregate([
        { $match: { instructor: new mongoose_1.default.Types.ObjectId(instructorId) } },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $lookup: {
                from: "pointwallets",
                localField: "user._id",
                foreignField: "user",
                as: "pointWallet"
            }
        },
        {
            $addFields: {
                points: {
                    $ifNull: [
                        { $arrayElemAt: ["$pointWallet", 0] },
                        { totalPoints: 0, byCourse: {} }
                    ]
                }
            }
        },
        {
            $project: {
                "user.name": 1,
                "user.email": 1,
                "user.picture": 1,
                status: 1,
                progress: 1,
                completedLessons: 1,
                timeSpent: 1,
                streak: 1,
                startedAt: 1,
                completedAt: 1,
                lastActivityAt: 1,
                "points.totalPoints": 1,
                "points.byCourse": 1
            }
        }
    ]);
    if (!studentsWithPoints || studentsWithPoints.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Enrollment Not Found");
    }
    return studentsWithPoints;
});
exports.EnrollmentServices = {
    enrollSelf, getMyEnrollment, listMyEnrollments, listCourseEnrollments, updateStatus, updateProgress, completeLesson, updateTimeSpent,
    calculateComprehensiveProgress, getUserCoursePoints, getEnrolledStudentsByInstructor
};
