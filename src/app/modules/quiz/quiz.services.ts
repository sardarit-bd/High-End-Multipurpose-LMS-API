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
import { any } from "zod";
import { EnrollmentServices } from "../enrollment/enrollment.services";
import { Enrollment } from "../enrollment/enrollment.model";

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

  // Update task with quizId reference
  task.quizId = quiz._id;
  await task.save();

  return { quiz, task };
};

const addQuestionToQuiz = async (
  quizId: string,
  actor: { userId: string; role: string },
  question: {
    type: "mcq" | "short";
    prompt: string;
    options?: { text: string; isCorrect?: boolean }[];
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
    pointsAwarded?: number; // final awarded points for this question
    perCorrectPoint?: number; // max points for this question
    question?: string; // Add question prompt
  }> = [];

  quiz.questions.forEach((q: any, qi: number) => {
    const ans = answers[qi];

    if (q.type === "mcq") {
      const sel = (ans && ans.type === "mcq") ? (ans.selected ?? []) : [];
      const isCorrect = q.options && exactMatch(sel, q.options);
      const per = q.perCorrectPoint ?? 0;
      const pts = isCorrect ? per : 0;
      if (isCorrect) correctCount += 1;
      autoPoints += pts;

      breakdown.push({ qIndex: qi, type: "mcq", selected: sel, autoPoints: pts, pointsAwarded: pts, question: q.prompt });
    } else if (q.type === "short") {
      needsReview = true;
      const text = (ans && ans.type === "short") ? String(ans.text ?? "") : "";
      breakdown.push({ qIndex: qi, type: "short", text, reviewPoints: 0, pointsAwarded: 0, perCorrectPoint: q.perCorrectPoint, question: q.prompt });
    } else {
      // Unknown type fallback: treat as short for safety
      needsReview = true;
      const text = (ans && (ans as any).text) ? String((ans as any).text) : "";
      breakdown.push({ qIndex: qi, type: "short", text, reviewPoints: 0, pointsAwarded: 0, perCorrectPoint: q.perCorrectPoint ?? 0, question: q.prompt });
    }
  });

  console.log("Quiz Submission Breakdown:", breakdown);

  // Award MCQ points immediately, short answers require review
  let awardedNow = autoPoints; // Award MCQ points immediately


  // Determine status based on question types
  const status = needsReview ? "pending_review" : "auto_scored";

  // Create submission with breakdown
  const submission = await TaskSubmission.create({
    task: task._id,
    unit: quiz.unit,
    course: quiz.course,
    user: userId,
    pointsAwarded: awardedNow,
    status,
    breakdown,
    quiz: quiz._id,
    type: "quiz",
    instructor: (await Course.findById(quiz.course))?.instructor,
  });

  // Award MCQ points immediately to student profile
  if (awardedNow > 0) {
    await GamificationServices.addPoints({
      userId,
      points: awardedNow,
      sourceType: "quiz",
      courseId: String(task.course),
      taskId: String(task._id),
      reason: needsReview ? "Quiz MCQ points (short answers pending review)" : "Quiz completed - all points awarded"
    });
  }
  const passed =
    typeof quiz.passMark === "number"
      ? (correctCount / totalQuestions) * 100 >= quiz.passMark
      : undefined;

  const progressData = await EnrollmentServices.calculateComprehensiveProgress(quiz.course, String(userId));


  console.log(progressData)
  const enrollment = await Enrollment.findOne({ course: task.course, user: userId });
  if (enrollment) {
    enrollment.progress = progressData.progress;
    enrollment.lastActivityAt = new Date();
    await enrollment.save();
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
};

// ---------- List by Unit ----------

const listByUnit = async (taskId: string) => {
  const task = await Task.findById(taskId);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");
  return Quiz.find({ task: taskId, isDeleted: false }).populate('task', 'title type maxPoints').sort({ createdAt: 1 });
};

const updateQuestionToQuiz = async (
  quizId: string,
  questionId: string,
  actor: { userId: string; role: string },
  question: {
    type: "mcq" | "short";
    prompt: string;
    options?: { text: string; isCorrect?: boolean }[];
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

  // Find and update the question
  const questionIndex = quiz.questions.findIndex((q: any) => String(q._id) === questionId);
  if (questionIndex === -1) throw new AppError(httpStatus.NOT_FOUND, "Question Not Found");

  // Validate MCQ options
  if (question.type === "mcq" && (!question.options || question.options.length < 2)) {
    throw new AppError(httpStatus.BAD_REQUEST, "MCQ must have at least 2 options");
  }

  // Update the question
  quiz.questions[questionIndex] = {
    ...quiz.questions[questionIndex],
    type: question.type,
    prompt: question.prompt,
    options: question.options || [],
    perCorrectPoint: question.perCorrectPoint,
  };

  await quiz.save();
  return quiz;
};

const deleteQuestionFromQuiz = async (
  questionId: string,
  actor: { userId: string; role: string }
) => {
  // Find the quiz containing this question
  const quiz = await Quiz.findOne({ "questions._id": questionId, isDeleted: false });
  if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Question Not Found");

  const course = await Course.findById(quiz.course);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Remove the question from the array
  quiz.questions = quiz.questions.filter((q: any) => String(q._id) !== questionId);
  await quiz.save();

  return { message: "Question deleted successfully" };
};

const fixExistingQuizTasks = async () => {
  // Find all quiz tasks that don't have quizId set
  const quizTasksWithoutQuizId = await Task.find({
    type: "quiz",
    quizId: { $exists: false },
    isDeleted: false
  });

  console.log(`Found ${quizTasksWithoutQuizId.length} quiz tasks without quizId`);

  for (const task of quizTasksWithoutQuizId) {
    // Check if a quiz already exists for this task
    const existingQuiz = await Quiz.findOne({
      task: task._id,
      isDeleted: false
    });

    if (existingQuiz) {
      // Update the task to reference the existing quiz
      task.quizId = existingQuiz._id;
      await task.save();
      console.log(`Updated task ${task._id} with quizId ${existingQuiz._id}`);
    } else {
      // Create a new quiz for this task
      const quiz = await Quiz.create({
        unit: task.unit,
        course: task.course,
        task: task._id,
        title: task.title,
        questions: [], // Empty initially
      });

      task.quizId = quiz._id;
      await task.save();
      console.log(`Created quiz ${quiz._id} for task ${task._id}`);
    }
  }

  return { message: `Fixed ${quizTasksWithoutQuizId.length} quiz tasks` };
};

export const QuizServices = { createQuiz, submitQuiz, listByUnit, addQuestionToQuiz, getQuizQuestions, updateQuestionToQuiz, deleteQuestionFromQuiz, fixExistingQuizTasks };
