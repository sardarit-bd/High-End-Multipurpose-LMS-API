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
exports.submissionController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const submission_services_1 = require("./submission.services");
const createReviewedSubmission = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { taskId } = req.params;
    const created = yield submission_services_1.SubmissionServices.createReviewedSubmission(taskId, token.userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Submission created (pending review)",
        data: created,
    });
}));
const gradeSubmission = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { taskId, submissionId } = req.body;
    const updated = yield submission_services_1.SubmissionServices.gradeSubmission(taskId, submissionId, { userId: token.userId, role: token.role }, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Submission graded",
        data: updated,
    });
}));
const getMyCourseTotal = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId } = req.params;
    const total = yield submission_services_1.SubmissionServices.myCourseTotal(courseId, token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My course points",
        data: total,
    });
}));
const getMySubmissionsByUnit = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { unitId } = req.params;
    const submissions = yield submission_services_1.SubmissionServices.getMySubmissionsByUnit(unitId, token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My submissions for unit",
        data: submissions,
    });
}));
const getMyTaskSubmission = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { taskId } = req.params;
    const submission = yield submission_services_1.SubmissionServices.getMyTaskSubmission(taskId, token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My task submission",
        data: submission,
    });
}));
const getMyAllSubmissions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const submission = yield submission_services_1.SubmissionServices.getMyAllSubmission(token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My All submission",
        data: submission,
    });
}));
const getSubmissionsForReview = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { taskId } = req.params;
    const submissions = yield submission_services_1.SubmissionServices.getSubmissionsForReview(taskId, token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Submissions pending review",
        data: submissions,
    });
}));
const reviewSubmission = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { submissionId } = req.params;
    const reviewed = yield submission_services_1.SubmissionServices.reviewSubmission(submissionId, { userId: token.userId, role: token.role }, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Submission reviewed successfully",
        data: reviewed,
    });
}));
const getSubmissionsByUnit = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { unitId } = req.params;
    const submissions = yield submission_services_1.SubmissionServices.getSubmissionsByUnit(unitId, token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Submissions for unit",
        data: submissions,
    });
}));
exports.submissionController = {
    createReviewedSubmission,
    gradeSubmission,
    getMyCourseTotal,
    getMySubmissionsByUnit,
    getMyTaskSubmission,
    getSubmissionsForReview,
    reviewSubmission,
    getSubmissionsByUnit,
    getMyAllSubmissions
};
