/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { TaskSubmission } from "./submission.model";
import { Task } from "../task/task.model";
import { Course } from "../course/course.model";
import { Quiz } from "../quiz/quiz.model";

type GradeScoreItem = { qIndex: number; reviewPoints: number };
type GradeBody = { scores: GradeScoreItem[]; status: "approved" | "rejected" };

const createReviewedSubmission = async (
  taskId: string,
  userId: string,
  payload: { artifactUrl: string; note?: string }
) => {
  const task = await Task.findById(taskId);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");
  if (task.type === "quiz") throw new AppError(httpStatus.BAD_REQUEST, "Use quiz flow for quiz tasks");

  const sub = await TaskSubmission.create({
    task: task._id,
    unit: task.unit,
    course: task.course,
    user: userId,
    artifactUrl: payload.artifactUrl,
    note: payload.note,
    status: "pending_review",
    pointsAwarded: 0,
  });

  return sub;
};

/**
 * Grade a submission that contains SHORT answers:
 * - Only SHORT items are graded here (MCQ autoPoints already stored in breakdown)
 * - We sum autoPoints + reviewPoints; apply task.maxPoints cap if present
 */

const gradeSubmission = async (
  taskId: string,
  submissionId: string,
  actor: { userId: string; role: string },
  body: GradeBody
) => {
  const task = await Task.findById(taskId);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");
  console.log("Task fetched for grading:", task);
  const course = await Course.findById(task.course);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  const sub = await TaskSubmission.findOne({ _id: submissionId });
  if (!sub) throw new AppError(httpStatus.NOT_FOUND, "Submission Not Found");

  // If this is a quiz submission, we need the quiz to verify per-question maxPoints for short items
  const quiz = await Quiz.findOne({ task: task._id });

  // ------ Normal reviewed task (video/pdf) grading ------
  if (!quiz) {
    if (typeof (body as any).pointsAwarded !== "number" || (body as any).pointsAwarded < 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "pointsAwarded must be a non-negative number");
    }
    let awarded = (body as any).pointsAwarded;
    if (typeof task.maxPoints === "number") awarded = Math.min(awarded, task.maxPoints);

    sub.pointsAwarded = body.status === "approved" ? awarded : 0;
    sub.status = body.status;
    await sub.save();
    return sub;
  }

  // ------ Quiz (short-answer) grading path ------
  if (!Array.isArray((body as any).scores) || (body as any).scores.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "scores array is required for quiz short-answer grading");
  }

  // Build index → shortQ.maxPoints map if quiz exists
  const shortCaps = new Map<number, number>();
  quiz.questions.forEach((q: any, i: number) => {
    if (q.type === "short") shortCaps.set(i, q.maxPoints ?? 0);
  });

  // Apply incoming scores to breakdown short items
  const b = sub.breakdown || [];
  for (const s of (body as any).scores) {
    const item = b.find((x: any) => x.qIndex === s.qIndex && x.type === "short");
    if (!item) throw new AppError(httpStatus.BAD_REQUEST, `No short answer at qIndex ${s.qIndex}`);

    const cap = shortCaps.has(s.qIndex) ? (shortCaps.get(s.qIndex) as number) : (item.maxPoints ?? 0);
    if (s.reviewPoints < 0 || s.reviewPoints > cap) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `reviewPoints for qIndex ${s.qIndex} must be between 0 and ${cap}`
      );
    }
    item.reviewPoints = s.reviewPoints;
  }

  // Sum auto + reviewed
  const autoPoints = b
    .filter((x: any) => x.type === "mcq")
    .reduce((acc: number, x: any) => acc + (x.autoPoints ?? 0), 0);
  const reviewSum = b
    .filter((x: any) => x.type === "short")
    .reduce((acc: number, x: any) => acc + (x.reviewPoints ?? 0), 0);

  let total = autoPoints + reviewSum;
  if (typeof task.maxPoints === "number") total = Math.min(total, task.maxPoints);

  sub.breakdown = b;
  sub.pointsAwarded = total;
  sub.status = "approved";
  await sub.save();

  return sub;
};

 
const myCourseTotal = async (courseId: string, userId: string) => {
    const course = await TaskSubmission.findOne({ course: courseId, user: userId });
    console.log("Course fetched:", course);
  const agg = await TaskSubmission.aggregate([
    { $match: { course: courseId}},
    // { $group: { _id: null, pointsAwarded: { $sum: "$pointsAwarded" } } },
  ]);
  console.log("Aggregation result:", agg);
  return { total: agg[0]?.pointsAwarded ?? 0 };
};



export const SubmissionServices = {
  createReviewedSubmission,
  gradeSubmission,
  myCourseTotal,
};
