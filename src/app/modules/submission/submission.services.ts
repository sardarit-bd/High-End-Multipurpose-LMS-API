/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { TaskSubmission } from "./submission.model";
import { Task } from "../task/task.model";
import { Unit } from "../unit/unit.model";
import { Course } from "../course/course.model";
import { Quiz } from "../quiz/quiz.model";
import { GamificationServices } from "../gamification/gamification.service";
import { Enrollment } from "../enrollment/enrollment.model";
import { EnrollmentServices } from "../enrollment/enrollment.services";

type GradeScoreItem = { qIndex: number; reviewPoints: number };
type GradeBody = {
  scores?: GradeScoreItem[];
  pointsAwarded?: number;
  status: "approved" | "rejected";
  reviewNote?: string;
};

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
    type: "task",
    instructor: (await Course.findById(task.course))?.instructor,
  });

  const progressData = await EnrollmentServices.calculateComprehensiveProgress(task.course, String(userId));
  console.log(progressData)
  const enrollment = await Enrollment.findOne({ course: task.course, user: userId });
  if (enrollment) {
    enrollment.progress = progressData.progress;
    enrollment.lastActivityAt = new Date();
    await enrollment.save();
  }

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
    if (typeof body.pointsAwarded !== "number" || body.pointsAwarded < 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "pointsAwarded must be a non-negative number");
    }
    let awarded = body.pointsAwarded;
    if (typeof task.maxPoints === "number") awarded = Math.min(awarded, task.maxPoints);

    // Set review information
    sub.pointsAwarded = body.status === "approved" ? awarded : 0;
    sub.status = "reviewed"; // Mark as reviewed
    sub.reviewedBy = actor.userId;
    sub.reviewedAt = new Date();
    sub.reviewNote = body.reviewNote;

    // Only award points if approved
    if (body.status === "approved" && sub.pointsAwarded > 0) {
      await GamificationServices.addPoints({
        userId: String(sub.user),
        points: sub.pointsAwarded,
        sourceType: "task",
        courseId: String(task.course),
        taskId: String(task._id),
        reason: "Reviewed task points"
      });
    }

    await sub.save();
    return sub;
  }

  // ------ Quiz (short-answer) grading path ------
  if (!Array.isArray((body as any).scores) || (body as any).scores.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "scores array is required for quiz short-answer grading");
  }

  // Build index → shortQ.perCorrectPoint map if quiz exists
  const shortCaps = new Map<number, number>();
  quiz.questions.forEach((q: any, i: number) => {
    if (q.type === "short") shortCaps.set(i, q.perCorrectPoint ?? 0);
  });

  // Apply incoming scores to breakdown short items
  const b = sub.breakdown || [];
  for (const s of (body as any).scores) {
    const item = b.find((x: any) => x.qIndex === s.qIndex && x.type === "short");
    if (!item) throw new AppError(httpStatus.BAD_REQUEST, `No short answer at qIndex ${s.qIndex}`);

    const cap = shortCaps.has(s.qIndex) ? (shortCaps.get(s.qIndex) as number) : (item.perCorrectPoint ?? 0);
    if (s.reviewPoints < 0 || s.reviewPoints > cap) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `reviewPoints for qIndex ${s.qIndex} must be between 0 and ${cap}`
      );
    }
    item.reviewPoints = s.reviewPoints;
    item.pointsAwarded = s.reviewPoints; // Update awarded points for short questions
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
  sub.markModified('breakdown'); // Ensure Mongoose detects changes to nested array
  sub.pointsAwarded = body.status === "approved" ? total : 0;
  sub.status = "reviewed"; // Mark as reviewed
  sub.reviewedBy = actor.userId;
  sub.reviewedAt = new Date();
  sub.reviewNote = body.reviewNote;
  await sub.save();

  // Award task review points only if approved
  if (body.status === "approved" && sub.pointsAwarded > 0) {
    await GamificationServices.addPoints({
      userId: String(sub.user),
      points: sub.pointsAwarded,
      sourceType: "task",
      courseId: String(task.course),
      taskId: String(task._id),
      reason: "Reviewed quiz task points"
    });
  }

  return sub;
};


const myCourseTotal = async (courseId: string, userId: string) => {
  const course = await TaskSubmission.findOne({ course: courseId, user: userId });
  const agg = await TaskSubmission.aggregate([
    { $match: { course: courseId } },
    // { $group: { _id: null, pointsAwarded: { $sum: "$pointsAwarded" } } },
  ]);
  console.log("Aggregation result:", agg);
  return { total: agg[0]?.pointsAwarded ?? 0 };
};

const getMySubmissionsByUnit = async (unitId: string, userId: string) => {
  const submissions = await TaskSubmission.find({
    unit: unitId,
    user: userId,
  }).populate('task', 'title type').lean();

  // Return array of submissions (frontend will convert to map if needed)
  return submissions;
};

const getMyTaskSubmission = async (taskId: string, userId: string) => {
  const submission = await TaskSubmission.findOne({
    task: taskId,
    user: userId,
  }).populate('task', 'title type maxPoints').lean();

  return submission;
};

const getMyAllSubmission = async (userId: string) => {
  const submission = await TaskSubmission.find({
    user: userId,
  })
    .populate('task', 'title maxPoints')
    .populate('course', 'title')
    .select('task course status reviewNote pointsAwarded')
    .lean();

  return submission;
};
const getSubmissionsForReview = async (taskId: string, instructorId: string) => {
  const task = await Task.findById(taskId);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");

  const course = await Course.findById(task.course);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(instructorId);
  const isAdmin = await checkAdminRole(instructorId);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  return TaskSubmission.find({
    task: taskId,
    status: { $in: ["pending_review", "reviewed"] }
  })
    .populate('user', 'name email avatar')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
};

const reviewSubmission = async (
  submissionId: string,
  actor: { userId: string; role: string },
  body: {
    pointsAwarded?: number;
    scores?: Array<{ qIndex: number; reviewPoints: number }>;
    reviewNote?: string;
  }
) => {
  const sub = await TaskSubmission.findById(submissionId);
  if (!sub) throw new AppError(httpStatus.NOT_FOUND, "Submission Not Found");

  // Check if submission is already reviewed - prevent multiple reviews
  if (sub.status === 'reviewed') {
    throw new AppError(httpStatus.BAD_REQUEST, "This submission has already been reviewed and cannot be reviewed again.");
  }

  const task = await Task.findById(sub.task);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");

  const course = await Course.findById(task.course);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Update review information
  sub.status = "reviewed"; // Mark as reviewed first
  sub.reviewedBy = actor.userId;
  sub.reviewedAt = new Date();
  sub.reviewNote = body.reviewNote;

  // Handle quiz vs task submissions differently
  if (body.scores && body.scores.length > 0) {
    // This is a quiz submission - update short answer points
    const quiz = await Quiz.findOne({ task: task._id });
    if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");

    // Build index → shortQ.perCorrectPoint map (max points for short questions)
    const shortCaps = new Map<number, number>();
    quiz.questions.forEach((q: any, i: number) => {
      if (q.type === "short") shortCaps.set(i, q.perCorrectPoint ?? 0);
    });

    // Update breakdown with instructor scores
    const b = sub.breakdown || [];

    for (const score of body.scores) {
      const item = b.find((x: any) => x.qIndex === score.qIndex && x.type === "short");
      if (!item) continue; // Skip if not found

      console.log('Grading short answer item:', item, 'with score:', score);
      const cap = shortCaps.has(score.qIndex) ? (shortCaps.get(score.qIndex) as number) : (item.perCorrectPoint ?? 0);
      console.log(`Cap for qIndex ${score.qIndex} is ${cap}`);
      item.reviewPoints = Math.min(score.reviewPoints, cap); // Ensure within limits
      item.pointsAwarded = item.reviewPoints; // Update awarded points for short questions
    }

    // Calculate total points: MCQ auto + short manual
    const autoPoints = b
      .filter((x: any) => x.type === "mcq")
      .reduce((acc: number, x: any) => acc + (x.autoPoints ?? 0), 0);
    const reviewSum = b
      .filter((x: any) => x.type === "short")
      .reduce((acc: number, x: any) => acc + (x.reviewPoints ?? 0), 0);

    let total = autoPoints + reviewSum;
    if (typeof task.maxPoints === "number") total = Math.min(total, task.maxPoints);

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
      await GamificationServices.addPoints({
        userId: String(sub.user),
        points: additionalPoints,
        sourceType: "quiz",
        courseId: String(task.course),
        taskId: String(task._id),
        reason: "Quiz short answer review points"
      });
    }
  } else {
    // This is a regular task submission
    if (body.pointsAwarded !== undefined) {
      let awarded = body.pointsAwarded;
      if (typeof task.maxPoints === "number") awarded = Math.min(awarded, task.maxPoints);
      sub.pointsAwarded = awarded;

      // Award points
      if (sub.pointsAwarded > 0) {
        await GamificationServices.addPoints({
          userId: String(sub.user),
          points: awarded,
          sourceType: "task",
          courseId: String(task.course),
          taskId: String(task._id),
          reason: "Task review points"
        });
      }
    } else {
      sub.pointsAwarded = 0;
    }
  }

  await sub.save();
  return sub.populate(['user', 'reviewedBy', 'task']);
};

const getSubmissionsByUnit = async (unitId: string, instructorId: string) => {
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");

  const course = await Course.findById(unit.course);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(instructorId);
  const isAdmin = await checkAdminRole(instructorId);
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  return TaskSubmission.find({ unit: unitId })
    .populate('user', 'name email avatar')
    .populate('task', 'title type maxPoints')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 });
};

const checkAdminRole = async (userId: string): Promise<boolean> => {
  // This would check if user has admin role - simplified for now
  return false;
};


export const SubmissionServices = {
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
