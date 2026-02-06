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
exports.enrollmentController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const enrollment_services_1 = require("./enrollment.services");
const course_model_1 = require("../course/course.model");
const enrollSelf = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId } = req.params;
    const course = yield course_model_1.Course.findById(courseId);
    const doc = yield enrollment_services_1.EnrollmentServices.enrollSelf(courseId, token.userId, course === null || course === void 0 ? void 0 : course.instructor);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.CREATED, success: true, message: "Enrolled", data: doc });
}));
const getMyEnrollment = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId } = req.params;
    const doc = yield enrollment_services_1.EnrollmentServices.getMyEnrollment(courseId, token.userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "My enrollment", data: doc });
}));
const listMyEnrollments = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const rows = yield enrollment_services_1.EnrollmentServices.listMyEnrollments(token.userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "My enrollments", data: rows });
}));
const listCourseEnrollments = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId } = req.params;
    const rows = yield enrollment_services_1.EnrollmentServices.listCourseEnrollments(courseId, { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Course enrollments", data: rows });
}));
const updateStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const doc = yield enrollment_services_1.EnrollmentServices.updateStatus({ userId: token.userId, role: token.role }, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Status updated", data: doc });
}));
const updateProgress = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId, enrollmentId } = req.params;
    const doc = yield enrollment_services_1.EnrollmentServices.updateProgress(courseId, enrollmentId, { userId: token.userId, role: token.role }, req.body.progress);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Progress updated", data: doc });
}));
const completeLesson = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId, enrollmentId } = req.params;
    const { lessonId } = req.body;
    const doc = yield enrollment_services_1.EnrollmentServices.completeLesson(courseId, enrollmentId, { userId: token.userId, role: token.role }, lessonId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Lesson completed", data: doc });
}));
const updateTimeSpent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId, enrollmentId } = req.params;
    const { timeSpent } = req.body;
    const doc = yield enrollment_services_1.EnrollmentServices.updateTimeSpent(courseId, enrollmentId, { userId: token.userId, role: token.role }, timeSpent);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Time spent updated", data: doc });
}));
const getUserCoursePoints = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId } = req.params;
    const points = yield enrollment_services_1.EnrollmentServices.getUserCoursePoints(courseId, token.userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "User course points", data: { points } });
}));
const getEnrolledStudentsByInstructor = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const students = yield enrollment_services_1.EnrollmentServices.getEnrolledStudentsByInstructor(token.userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "User course points", data: students });
}));
exports.enrollmentController = { enrollSelf, getMyEnrollment, listMyEnrollments, listCourseEnrollments, updateStatus, updateProgress, completeLesson, updateTimeSpent, getUserCoursePoints, getEnrolledStudentsByInstructor };
