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
exports.QuizServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const quiz_model_1 = require("./quiz.model");
const unit_model_1 = require("../unit/unit.model");
const course_model_1 = require("../course/course.model");
const task_model_1 = require("../task/task.model");
const submission_model_1 = require("../submission/submission.model"); // for creating the mixed submission
const gamification_service_1 = require("../gamification/gamification.service");
const enrollment_services_1 = require("../enrollment/enrollment.services");
const enrollment_model_1 = require("../enrollment/enrollment.model");
/** Normalize legacy answers format (number[][]) to mixed objects */
function normalizeAnswers(raw, totalQuestions) {
    // If first item looks like legacy array form -> MCQ only
    if (Array.isArray(raw) && (raw.length === 0 || Array.isArray(raw[0]))) {
        // number[][]
        return Array.from({ length: totalQuestions }, (_, i) => {
            const selected = Array.isArray(raw[i]) ? raw[i] : [];
            return { type: "mcq", selected };
        });
    }
    // Otherwise expect array of MixedAnswer objects
    return Array.from({ length: totalQuestions }, (_, i) => {
        var _a;
        const a = raw === null || raw === void 0 ? void 0 : raw[i];
        if (a && a.type === "short") {
            return { type: "short", text: String((_a = a.text) !== null && _a !== void 0 ? _a : "") };
        }
        const selected = Array.isArray(a === null || a === void 0 ? void 0 : a.selected) ? a.selected : [];
        return { type: "mcq", selected };
    });
}
function exactMatch(selectedIdx, options) {
    const correctIdx = options
        .map((o, i) => (o.isCorrect ? i : -1))
        .filter(i => i >= 0)
        .sort((a, b) => a - b);
    const sel = [...new Set(selectedIdx)].sort((a, b) => a - b);
    if (sel.length !== correctIdx.length)
        return false;
    for (let i = 0; i < sel.length; i++) {
        if (sel[i] !== correctIdx[i])
            return false;
    }
    return true;
}
// ---------- Create Quiz + Task(type="quiz") ----------
const createQuiz = (unitId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
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
    // Create Task first (1–1 with quiz)
    const task = yield task_model_1.Task.create({
        unit: unit._id,
        course: course._id,
        title: payload.title,
        type: "quiz",
        maxPoints: payload.maxPoints,
    });
    // Create Quiz shell (no questions yet)
    const quiz = yield quiz_model_1.Quiz.create({
        unit: unit._id,
        course: course._id,
        task: task._id,
        title: payload.title,
        passMark: payload.passMark || 50,
        questions: [], // Empty initially
    });
    // Update task with quizId reference
    task.quizId = quiz._id;
    yield task.save();
    return { quiz, task };
});
const addQuestionToQuiz = (quizId, actor, question) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_model_1.Quiz.findById(quizId);
    if (!quiz || quiz.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Quiz Not Found");
    const course = yield course_model_1.Course.findById(quiz.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Validate MCQ options
    if (question.type === "mcq" && (!question.options || question.options.length < 2)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "MCQ must have at least 2 options");
    }
    // Push question to array
    quiz.questions.push({
        type: question.type,
        prompt: question.prompt,
        options: question.options || [],
        perCorrectPoint: question.perCorrectPoint,
    });
    yield quiz.save();
    return quiz;
});
const getQuizQuestions = (quizId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const quiz = yield quiz_model_1.Quiz.findById(quizId).populate("course unit task");
    if (!quiz || quiz.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Quiz Not Found");
    const course = quiz.course;
    const isOwner = course && String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    // Deep clone questions
    const questions = JSON.parse(JSON.stringify(quiz.questions || []));
    // For students → hide correct answers
    if (!isOwner && !isAdmin) {
        for (const q of questions) {
            if (q.type === "mcq" && ((_a = q.options) === null || _a === void 0 ? void 0 : _a.length)) {
                q.options = q.options.map((o) => ({
                    text: o.text,
                }));
            }
        }
    }
    return {
        quizId: quiz._id,
        title: quiz.title,
        unit: quiz.unit,
        course: quiz.course,
        task: quiz.task,
        passMark: (_b = quiz.passMark) !== null && _b !== void 0 ? _b : 50,
        questions,
    };
});
// ---------- Submit (MCQ auto + Short pending review) ----------
/**
 * Student submits quiz answers (supports MCQ + Short):
 * - MCQ questions are auto-scored using perCorrectPoint (question override or task default)
 * - Short answers are stored for instructor review (maxPoints per question)
 * Result:
 *  - Creates a TaskSubmission with per-question breakdown
 *  - status = "auto_scored" if no short Qs, otherwise "pending_review"
 *  - pointsAwarded = autoPoints (capped to task.maxPoints if set)
 */
const submitQuiz = (quizId, userId, answersRaw // supports legacy number[][] or mixed array of {type, selected|text}
) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const quiz = yield quiz_model_1.Quiz.findById(quizId);
    if (!quiz || quiz.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Quiz Not Found");
    // Load linked Task (perCorrectPoint / maxPoints live here by default)
    const task = quiz.task
        ? yield task_model_1.Task.findById(quiz.task)
        : yield task_model_1.Task.findOne({ unit: quiz.unit, course: quiz.course, type: "quiz", title: quiz.title });
    if (!task)
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Linked Task not found for quiz");
    const totalQuestions = quiz.questions.length;
    const answers = normalizeAnswers(answersRaw, totalQuestions);
    let correctCount = 0;
    let autoPoints = 0;
    let needsReview = false;
    // Build per-question breakdown
    const breakdown = [];
    quiz.questions.forEach((q, qi) => {
        var _a, _b, _c, _d;
        const ans = answers[qi];
        if (q.type === "mcq") {
            const sel = (ans && ans.type === "mcq") ? ((_a = ans.selected) !== null && _a !== void 0 ? _a : []) : [];
            const isCorrect = q.options && exactMatch(sel, q.options);
            const per = (_b = q.perCorrectPoint) !== null && _b !== void 0 ? _b : 0;
            const pts = isCorrect ? per : 0;
            if (isCorrect)
                correctCount += 1;
            autoPoints += pts;
            breakdown.push({ qIndex: qi, type: "mcq", selected: sel, autoPoints: pts, pointsAwarded: pts, question: q.prompt });
        }
        else if (q.type === "short") {
            needsReview = true;
            const text = (ans && ans.type === "short") ? String((_c = ans.text) !== null && _c !== void 0 ? _c : "") : "";
            breakdown.push({ qIndex: qi, type: "short", text, reviewPoints: 0, pointsAwarded: 0, perCorrectPoint: q.perCorrectPoint, question: q.prompt });
        }
        else {
            // Unknown type fallback: treat as short for safety
            needsReview = true;
            const text = (ans && ans.text) ? String(ans.text) : "";
            breakdown.push({ qIndex: qi, type: "short", text, reviewPoints: 0, pointsAwarded: 0, perCorrectPoint: (_d = q.perCorrectPoint) !== null && _d !== void 0 ? _d : 0, question: q.prompt });
        }
    });
    console.log("Quiz Submission Breakdown:", breakdown);
    // Award MCQ points immediately, short answers require review
    let awardedNow = autoPoints; // Award MCQ points immediately
    // Determine status based on question types
    const status = needsReview ? "pending_review" : "auto_scored";
    // Create submission with breakdown
    const submission = yield submission_model_1.TaskSubmission.create({
        task: task._id,
        unit: quiz.unit,
        course: quiz.course,
        user: userId,
        pointsAwarded: awardedNow,
        status,
        breakdown,
        quiz: quiz._id,
        type: "quiz",
        instructor: (_a = (yield course_model_1.Course.findById(quiz.course))) === null || _a === void 0 ? void 0 : _a.instructor,
    });
    // Award MCQ points immediately to student profile
    if (awardedNow > 0) {
        yield gamification_service_1.GamificationServices.addPoints({
            userId,
            points: awardedNow,
            sourceType: "quiz",
            courseId: String(task.course),
            taskId: String(task._id),
            reason: needsReview ? "Quiz MCQ points (short answers pending review)" : "Quiz completed - all points awarded"
        });
    }
    const passed = typeof quiz.passMark === "number"
        ? (correctCount / totalQuestions) * 100 >= quiz.passMark
        : undefined;
    const progressData = yield enrollment_services_1.EnrollmentServices.calculateComprehensiveProgress(quiz.course, String(userId));
    console.log(progressData);
    const enrollment = yield enrollment_model_1.Enrollment.findOne({ course: task.course, user: userId });
    if (enrollment) {
        enrollment.progress = progressData.progress;
        enrollment.lastActivityAt = new Date();
        yield enrollment.save();
    }
    return {
        correctCount,
        totalQuestions,
        autoPoints,
        pointsAwarded: awardedNow,
        needsReview,
        submissionId: String(submission._id),
        passed
    };
});
// ---------- List by Unit ----------
const listByUnit = (taskId) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_model_1.Task.findById(taskId);
    if (!task || task.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Task Not Found");
    return quiz_model_1.Quiz.find({ task: taskId, isDeleted: false }).populate('task', 'title type maxPoints').sort({ createdAt: 1 });
});
const updateQuestionToQuiz = (quizId, questionId, actor, question) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_model_1.Quiz.findById(quizId);
    if (!quiz || quiz.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Quiz Not Found");
    const course = yield course_model_1.Course.findById(quiz.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Find and update the question
    const questionIndex = quiz.questions.findIndex((q) => String(q._id) === questionId);
    if (questionIndex === -1)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Question Not Found");
    // Validate MCQ options
    if (question.type === "mcq" && (!question.options || question.options.length < 2)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "MCQ must have at least 2 options");
    }
    // Update the question
    quiz.questions[questionIndex] = Object.assign(Object.assign({}, quiz.questions[questionIndex]), { type: question.type, prompt: question.prompt, options: question.options || [], perCorrectPoint: question.perCorrectPoint });
    yield quiz.save();
    return quiz;
});
const deleteQuestionFromQuiz = (questionId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the quiz containing this question
    const quiz = yield quiz_model_1.Quiz.findOne({ "questions._id": questionId, isDeleted: false });
    if (!quiz)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Question Not Found");
    const course = yield course_model_1.Course.findById(quiz.course);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    // Remove the question from the array
    quiz.questions = quiz.questions.filter((q) => String(q._id) !== questionId);
    yield quiz.save();
    return { message: "Question deleted successfully" };
});
const fixExistingQuizTasks = () => __awaiter(void 0, void 0, void 0, function* () {
    // Find all quiz tasks that don't have quizId set
    const quizTasksWithoutQuizId = yield task_model_1.Task.find({
        type: "quiz",
        quizId: { $exists: false },
        isDeleted: false
    });
    console.log(`Found ${quizTasksWithoutQuizId.length} quiz tasks without quizId`);
    for (const task of quizTasksWithoutQuizId) {
        // Check if a quiz already exists for this task
        const existingQuiz = yield quiz_model_1.Quiz.findOne({
            task: task._id,
            isDeleted: false
        });
        if (existingQuiz) {
            // Update the task to reference the existing quiz
            task.quizId = existingQuiz._id;
            yield task.save();
            console.log(`Updated task ${task._id} with quizId ${existingQuiz._id}`);
        }
        else {
            // Create a new quiz for this task
            const quiz = yield quiz_model_1.Quiz.create({
                unit: task.unit,
                course: task.course,
                task: task._id,
                title: task.title,
                questions: [], // Empty initially
            });
            task.quizId = quiz._id;
            yield task.save();
            console.log(`Created quiz ${quiz._id} for task ${task._id}`);
        }
    }
    return { message: `Fixed ${quizTasksWithoutQuizId.length} quiz tasks` };
});
exports.QuizServices = { createQuiz, submitQuiz, listByUnit, addQuestionToQuiz, getQuizQuestions, updateQuestionToQuiz, deleteQuestionFromQuiz, fixExistingQuizTasks };
