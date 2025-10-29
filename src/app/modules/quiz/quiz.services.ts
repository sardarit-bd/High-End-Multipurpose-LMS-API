/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Quiz } from "./quiz.model";
import { Unit } from "../unit/unit.model";
import { Course } from "../course/course.model";
import { Task } from "../task/task.model";
import { SubmissionServices } from "../submission/submission.services"; // may be unused if you grade here
import { TaskSubmission } from "../submission/submission.model"; // for creating the mixed submission
import { GamificationServices } from "../gamification/gamification.service";

// ---------- Helpers ----------

type McqAnswer = { type: "mcq"; selected: number[] };
type ShortAnswer = { type: "short"; text: string };
type MixedAnswer = McqAnswer | ShortAnswer;

/** Normalize legacy answers format (number[][]) to mixed objects */
function normalizeAnswers(raw: any[], totalQuestions: number): MixedAnswer[] {
  // If first item looks like legacy array form -> MCQ only
  if (Array.isArray(raw) && (raw.length === 0 || Array.isArray(raw[0]))) {
    // number[][]
    return Array.from({ length: totalQuestions }, (_, i) => {
      const selected = Array.isArray(raw[i]) ? raw[i] : [];
      return { type: "mcq", selected } as McqAnswer;
    });
  }
  // Otherwise expect array of MixedAnswer objects
  return Array.from({ length: totalQuestions }, (_, i) => {
    const a = raw?.[i];
    if (a && a.type === "short") {
      return { type: "short", text: String(a.text ?? "") } as ShortAnswer;
    }
    const selected = Array.isArray(a?.selected) ? a.selected : [];
    return { type: "mcq", selected } as McqAnswer;
  });
}

function exactMatch(selectedIdx: number[], options: Array<{ isCorrect: boolean }>): boolean {
  const correctIdx = options
    .map((o, i) => (o.isCorrect ? i : -1))
    .filter(i => i >= 0)
    .sort((a, b) => a - b);

  const sel = [...new Set(selectedIdx)].sort((a, b) => a - b);
  if (sel.length !== correctIdx.length) return false;
  for (let i = 0; i < sel.length; i++) {
    if (sel[i] !== correctIdx[i]) return false;
  }
  return true;
}

// ---------- Create Quiz + Task(type="quiz") ----------

const createQuiz = async (
  unitId: string,
  payload: {
    title: Record<string, string>;
    passMark?: number;
    perCorrectPoint?: number;
    maxPoints?: number;
  },
  actor: { userId: string; role: string }
) => {
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");

  const course = await Course.findById(unit.course);
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Create Task first (1–1 with quiz)
  const task = await Task.create({
    unit: unit._id,
    course: course._id,
    title: payload.title,
    type: "quiz",
    perCorrectPoint: payload.perCorrectPoint || 1,
    maxPoints: payload.maxPoints,
  });

  // Create Quiz shell (no questions yet)
  const quiz = await Quiz.create({
    unit: unit._id,
    course: course._id,
    task: task._id,
    title: payload.title,
    passMark: payload.passMark || 50,
    questions: [], // Empty initially
  });

  return { quiz, task };
};

const addQuestionToQuiz = async (
  quizId: string,
  actor: { userId: string; role: string },
  question: {
    type: "mcq" | "short";
    prompt: string;
    options?: { text: string; isCorrect?: boolean }[];
    maxPoints?: number;
    perCorrectPoint?: number;
  }
) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Quiz Not Found");

  const course = await Course.findById(quiz.course);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Validate MCQ options
  if (question.type === "mcq" && (!question.options || question.options.length < 2)) {
    throw new AppError(httpStatus.BAD_REQUEST, "MCQ must have at least 2 options");
  }

  // Push question to array
  quiz.questions.push({
    type: question.type,
    prompt: question.prompt,
    options: question.options || [],
    maxPoints: question.maxPoints,
    perCorrectPoint: question.perCorrectPoint,
  });

  await quiz.save();
  return quiz;
};


const getQuizQuestions = async (
  quizId: string,
  actor: { userId: string; role: string }
) => {
  const quiz = await Quiz.findById(quizId).populate("course unit task");
  if (!quiz || quiz.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Quiz Not Found");

  const course = quiz.course;
  const isOwner =
    course && String((course as any).instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";

  // Deep clone questions
  const questions = JSON.parse(JSON.stringify(quiz.questions || []));

  // For students → hide correct answers
  if (!isOwner && !isAdmin) {
    for (const q of questions) {
      if (q.type === "mcq" && q.options?.length) {
        q.options = q.options.map((o: any) => ({
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
    passMark: (quiz as any).passMark ?? 50,
    questions,
  };
};

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
const submitQuiz = async (
  quizId: string,
  userId: string,
  answersRaw: any[] // supports legacy number[][] or mixed array of {type, selected|text}
) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz || quiz.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Quiz Not Found");

  // Load linked Task (perCorrectPoint / maxPoints live here by default)
  const task = quiz.task
    ? await Task.findById(quiz.task)
    : await Task.findOne({ unit: quiz.unit, course: quiz.course, type: "quiz", title: quiz.title });

  if (!task) throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Linked Task not found for quiz");
  console.log("Quiz Submission Task:", task);
  const totalQuestions = quiz.questions.length;
  const answers = normalizeAnswers(answersRaw, totalQuestions);


  let correctCount = 0;
  let autoPoints = 0;
  let needsReview = false;

  // Build per-question breakdown
  const breakdown: Array<{
    qIndex: number;
    type: "mcq" | "short";
    selected?: number[];
    text?: string;
    autoPoints?: number;
    reviewPoints?: number;
    maxPoints?: number;
  }> = [];

  quiz.questions.forEach((q: any, qi: number) => {
    const ans = answers[qi];

    if (q.type === "mcq") {
      const sel = (ans && ans.type === "mcq") ? (ans.selected ?? []) : [];
      const isCorrect = q.options && exactMatch(sel, q.options);
      const per = typeof q.perCorrectPoint === "number" ? q.perCorrectPoint : (task.perCorrectPoint ?? 0);
      const pts = isCorrect ? per : 0;
      if (isCorrect) correctCount += 1;
      autoPoints += pts;

      breakdown.push({ qIndex: qi, type: "mcq", selected: sel, autoPoints: pts });
    } else if (q.type === "short") {
      needsReview = true;
      const text = (ans && ans.type === "short") ? String(ans.text ?? "") : "";
      breakdown.push({ qIndex: qi, type: "short", text, maxPoints: q.maxPoints });
    } else {
      // Unknown type fallback: treat as short for safety
      needsReview = true;
      const text = (ans && (ans as any).text) ? String((ans as any).text) : "";
      breakdown.push({ qIndex: qi, type: "short", text, maxPoints: q.maxPoints ?? 0 });
    }
  });

  console.log("Quiz Submission Breakdown:", breakdown);
  // Apply cap to autoPoints portion (final cap applied again after review)
  let awardedNow = autoPoints;
  if (typeof task.maxPoints === "number") {
    awardedNow = Math.min(awardedNow, task.maxPoints);
  }

  const status: "auto_scored" | "pending_review" = needsReview ? "pending_review" : "auto_scored";

  // Create submission with breakdown
  const submission = await TaskSubmission.create({
    task: task._id,
    unit: quiz.unit,
    course: quiz.course,
    user: userId,
    pointsAwarded: awardedNow,
    status,
    breakdown
  });

  // Give quiz points to user
  if (submission.pointsAwarded > 0) {
    await GamificationServices.addPoints({
      userId,
      points: submission.pointsAwarded,
      sourceType: "quiz",
      courseId: String(task.course),
      taskId: String(task._id),
      reason: `Quiz points`
    });
  }
  const passed =
    typeof quiz.passMark === "number"
      ? (correctCount / totalQuestions) * 100 >= quiz.passMark
      : undefined;

  return {
    correctCount,
    totalQuestions,
    autoPoints,
    pointsAwarded: awardedNow,
    needsReview,
    submissionId: String(submission._id),
    passed
  };
};

// ---------- List by Unit ----------

const listByUnit = async (unitId: string) => {
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");
  return Quiz.find({ unit: unitId, isDeleted: false }).sort({ createdAt: 1 });
};

export const QuizServices = { createQuiz, submitQuiz, listByUnit, addQuestionToQuiz, getQuizQuestions };
