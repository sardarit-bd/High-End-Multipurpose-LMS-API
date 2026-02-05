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
exports.SubmissionServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const submission_model_1 = require("./submission.model");
const task_model_1 = require("../task/task.model");
const unit_model_1 = require("../unit/unit.model");
const course_model_1 = require("../course/course.model");
const quiz_model_1 = require("../quiz/quiz.model");
const gamification_service_1 = require("../gamification/gamification.service");
const enrollment_model_1 = require("../enrollment/enrollment.model");
const enrollment_services_1 = require("../enrollment/enrollment.services");
const createReviewedSubmission = (taskId, userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const task = yield task_model_1.Task.findById(taskId);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    if (task.type === "quiz")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Use quiz flow for quiz tasks");
    const sub = yield submission_model_1.TaskSubmission.create({
        task: task._id,
        unit: task.unit,
        course: task.course,
        user: userId,
        artifactUrl: payload.artifactUrl,
        note: payload.note,
        status: "pending_review",
        pointsAwarded: 0,
        type: "task",
        instructor: (_a = (yield course_model_1.Course.findById(task.course))) === null || _a === void 0 ? void 0 : _a.instructor,
    });
    const progressData = yield enrollment_services_1.EnrollmentServices.calculateComprehensiveProgress(task.course, String(userId));
    console.log(progressData);
    const enrollment = yield enrollment_model_1.Enrollment.findOne({ course: task.course, user: userId });
    if (enrollment) {
        enrollment.progress = progressData.progress;
        enrollment.lastActivityAt = new Date();
        yield enrollment.save();
    }
    return sub;
});
/**
 * Grade a submission that contains SHORT answers:
 * - Only SHORT items are graded here (MCQ autoPoints already stored in breakdown)
 * - We sum autoPoints + reviewPoints; apply task.maxPoints cap if present
 */
const gradeSubmission = (taskId, submissionId, actor, body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const task = yield task_model_1.Task.findById(taskId);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    const course = yield course_model_1.Course.findById(task.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    const sub = yield submission_model_1.TaskSubmission.findOne({ _id: submissionId });
    if (!sub)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Submission Not Found");
    // If this is a quiz submission, we need the quiz to verify per-question maxPoints for short items
    const quiz = yield quiz_model_1.Quiz.findOne({ task: task._id });
    // ------ Normal reviewed task (video/pdf) grading ------
    if (!quiz) {
        if (typeof body.pointsAwarded !== "number" || body.pointsAwarded < 0) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "pointsAwarded must be a non-negative number");
        }
        let awarded = body.pointsAwarded;
        if (typeof task.maxPoints === "number")
            awarded = Math.min(awarded, task.maxPoints);
        // Set review information
        sub.pointsAwarded = body.status === "approved" ? awarded : 0;
        sub.status = "reviewed"; // Mark as reviewed
        sub.reviewedBy = actor.userId;
        sub.reviewedAt = new Date();
        sub.reviewNote = body.reviewNote;
        // Only award points if approved
        if (body.status === "approved" && sub.pointsAwarded > 0) {
            yield gamification_service_1.GamificationServices.addPoints({
                userId: String(sub.user),
                points: sub.pointsAwarded,
                sourceType: "task",
                courseId: String(task.course),
                taskId: String(task._id),
                reason: "Reviewed task points"
            });
        }
        yield sub.save();
        return sub;
    }
    // ------ Quiz (short-answer) grading path ------
    if (!Array.isArray(body.scores) || body.scores.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "scores array is required for quiz short-answer grading");
    }
    // Build index → shortQ.perCorrectPoint map if quiz exists
    const shortCaps = new Map();
    quiz.questions.forEach((q, i) => {
        var _a;
        if (q.type === "short")
            shortCaps.set(i, (_a = q.perCorrectPoint) !== null && _a !== void 0 ? _a : 0);
    });
    // Apply incoming scores to breakdown short items
    const b = sub.breakdown || [];
    for (const s of body.scores) {
        const item = b.find((x) => x.qIndex === s.qIndex && x.type === "short");
        if (!item)
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `No short answer at qIndex ${s.qIndex}`);
        const cap = shortCaps.has(s.qIndex) ? shortCaps.get(s.qIndex) : ((_a = item.perCorrectPoint) !== null && _a !== void 0 ? _a : 0);
        if (s.reviewPoints < 0 || s.reviewPoints > cap) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `reviewPoints for qIndex ${s.qIndex} must be between 0 and ${cap}`);
        }
        item.reviewPoints = s.reviewPoints;
        item.pointsAwarded = s.reviewPoints; // Update awarded points for short questions
    }
    // Sum auto + reviewed
    const autoPoints = b
        .filter((x) => x.type === "mcq")
        .reduce((acc, x) => { var _a; return acc + ((_a = x.autoPoints) !== null && _a !== void 0 ? _a : 0); }, 0);
    const reviewSum = b
        .filter((x) => x.type === "short")
        .reduce((acc, x) => { var _a; return acc + ((_a = x.reviewPoints) !== null && _a !== void 0 ? _a : 0); }, 0);
    let total = autoPoints + reviewSum;
    if (typeof task.maxPoints === "number")
        total = Math.min(total, task.maxPoints);
    sub.breakdown = b;
    sub.markModified('breakdown'); // Ensure Mongoose detects changes to nested array
    sub.pointsAwarded = body.status === "approved" ? total : 0;
    sub.status = "reviewed"; // Mark as reviewed
    sub.reviewedBy = actor.userId;
    sub.reviewedAt = new Date();
    sub.reviewNote = body.reviewNote;
    yield sub.save();
    // Award task review points only if approved
    if (body.status === "approved" && sub.pointsAwarded > 0) {
        yield gamification_service_1.GamificationServices.addPoints({
            userId: String(sub.user),
            points: sub.pointsAwarded,
            sourceType: "task",
            courseId: String(task.course),
            taskId: String(task._id),
            reason: "Reviewed quiz task points"
        });
    }
    return sub;
});
const myCourseTotal = (courseId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const course = yield submission_model_1.TaskSubmission.findOne({ course: courseId, user: userId });
    const agg = yield submission_model_1.TaskSubmission.aggregate([
        { $match: { course: courseId } },
        // { $group: { _id: null, pointsAwarded: { $sum: "$pointsAwarded" } } },
    ]);
    console.log("Aggregation result:", agg);
    return { total: (_b = (_a = agg[0]) === null || _a === void 0 ? void 0 : _a.pointsAwarded) !== null && _b !== void 0 ? _b : 0 };
});
const getMySubmissionsByUnit = (unitId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const submissions = yield submission_model_1.TaskSubmission.find({
        unit: unitId,
        user: userId,
    }).populate('task', 'title type').lean();
    // Return array of submissions (frontend will convert to map if needed)
    return submissions;
});
const getMyTaskSubmission = (taskId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield submission_model_1.TaskSubmission.findOne({
        task: taskId,
        user: userId,
    }).populate('task', 'title type maxPoints').lean();
    return submission;
});
const getMyAllSubmission = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const submission = yield submission_model_1.TaskSubmission.find({
        user: userId,
    })
        .populate('task', 'title maxPoints')
        .populate('course', 'title')
        .select('task course status reviewNote pointsAwarded')
        .lean();
    return submission;
});
const getSubmissionsForReview = (taskId, instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_model_1.Task.findById(taskId);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    const course = yield course_model_1.Course.findById(task.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(instructorId);
    const isAdmin = yield checkAdminRole(instructorId);
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return submission_model_1.TaskSubmission.find({
        task: taskId,
        status: { $in: ["pending_review", "reviewed"] }
    })
        .populate('user', 'name email avatar')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 });
});
const reviewSubmission = (submissionId, actor, body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const sub = yield submission_model_1.TaskSubmission.findById(submissionId);
    if (!sub)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Submission Not Found");
    // Check if submission is already reviewed - prevent multiple reviews
    if (sub.status === 'reviewed') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "This submission has already been reviewed and cannot be reviewed again.");
    }
    const task = yield task_model_1.Task.findById(sub.task);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    const course = yield course_model_1.Course.findById(task.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Update review information
    sub.status = "reviewed"; // Mark as reviewed first
    sub.reviewedBy = actor.userId;
    sub.reviewedAt = new Date();
    sub.reviewNote = body.reviewNote;
    // Handle quiz vs task submissions differently
    if (body.scores && body.scores.length > 0) {
        // This is a quiz submission - update short answer points
        const quiz = yield quiz_model_1.Quiz.findOne({ task: task._id });
        if (!quiz)
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Quiz not found");
        // Build index → shortQ.perCorrectPoint map (max points for short questions)
        const shortCaps = new Map();
        quiz.questions.forEach((q, i) => {
            var _a;
            if (q.type === "short")
                shortCaps.set(i, (_a = q.perCorrectPoint) !== null && _a !== void 0 ? _a : 0);
        });
        // Update breakdown with instructor scores
        const b = sub.breakdown || [];
        for (const score of body.scores) {
            const item = b.find((x) => x.qIndex === score.qIndex && x.type === "short");
            if (!item)
                continue; // Skip if not found
            console.log('Grading short answer item:', item, 'with score:', score);
            const cap = shortCaps.has(score.qIndex) ? shortCaps.get(score.qIndex) : ((_a = item.perCorrectPoint) !== null && _a !== void 0 ? _a : 0);
            console.log(`Cap for qIndex ${score.qIndex} is ${cap}`);
            item.reviewPoints = Math.min(score.reviewPoints, cap); // Ensure within limits
            item.pointsAwarded = item.reviewPoints; // Update awarded points for short questions
        }
        // Calculate total points: MCQ auto + short manual
        const autoPoints = b
            .filter((x) => x.type === "mcq")
            .reduce((acc, x) => { var _a; return acc + ((_a = x.autoPoints) !== null && _a !== void 0 ? _a : 0); }, 0);
        const reviewSum = b
            .filter((x) => x.type === "short")
            .reduce((acc, x) => { var _a; return acc + ((_a = x.reviewPoints) !== null && _a !== void 0 ? _a : 0); }, 0);
        let total = autoPoints + reviewSum;
        if (typeof task.maxPoints === "number")
            total = Math.min(total, task.maxPoints);
        sub.breakdown = b;
        sub.markModified('breakdown'); // Ensure Mongoose detects changes to nested array
        // Calculate final total points (MCQ auto + short answer review)
        const totalPointsNow = autoPoints + reviewSum;
        const finalPoints = Math.min(totalPointsNow, task.maxPoints || totalPointsNow);
        // Calculate additional points to award (final total - previously awarded MCQ points)
        const previouslyAwarded = sub.pointsAwarded || 0; // MCQ points already awarded
        const additionalPoints = finalPoints - previouslyAwarded;
        // Update submission with final points
        sub.pointsAwarded = finalPoints;
        // Award/deduct additional points if any
        if (additionalPoints > 0) {
            yield gamification_service_1.GamificationServices.addPoints({
                userId: String(sub.user),
                points: additionalPoints,
                sourceType: "quiz",
                courseId: String(task.course),
                taskId: String(task._id),
                reason: "Quiz short answer review points"
            });
        }
    }
    else {
        // This is a regular task submission
        if (body.pointsAwarded !== undefined) {
            let awarded = body.pointsAwarded;
            if (typeof task.maxPoints === "number")
                awarded = Math.min(awarded, task.maxPoints);
            sub.pointsAwarded = awarded;
            // Award points
            if (sub.pointsAwarded > 0) {
                yield gamification_service_1.GamificationServices.addPoints({
                    userId: String(sub.user),
                    points: awarded,
                    sourceType: "task",
                    courseId: String(task.course),
                    taskId: String(task._id),
                    reason: "Task review points"
                });
            }
        }
        else {
            sub.pointsAwarded = 0;
        }
    }
    yield sub.save();
    return sub.populate(['user', 'reviewedBy', 'task']);
});
const getSubmissionsByUnit = (unitId, instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    const unit = yield unit_model_1.Unit.findById(unitId);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    const course = yield course_model_1.Course.findById(unit.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(instructorId);
    const isAdmin = yield checkAdminRole(instructorId);
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return submission_model_1.TaskSubmission.find({ unit: unitId })
        .populate('user', 'name email avatar')
        .populate('task', 'title type maxPoints')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 });
});
const checkAdminRole = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // This would check if user has admin role - simplified for now
    return false;
});
exports.SubmissionServices = {
    createReviewedSubmission,
    gradeSubmission,
    myCourseTotal,
    getMySubmissionsByUnit,
    getMyTaskSubmission,
    getSubmissionsForReview,
    reviewSubmission,
    getSubmissionsByUnit,
    getMyAllSubmission
};
