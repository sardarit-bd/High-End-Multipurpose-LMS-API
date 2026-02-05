/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Enrollment } from "./enrollment.model";
import { Course } from "../course/course.model";
import { BadgeServices } from "../badge/badge.service";
import mongoose from "mongoose";
import { JwtPayload } from "jsonwebtoken";

const ensureCourse = async (courseId: string) => {
  const course = await Course.findById(courseId);
  if (!course || (course as any).isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");
  return course;
};

// Idempotent self-enroll (used by payment success)
const enrollSelf = async (courseId: string, userId: string, instructor: string) => {
  await ensureCourse(courseId);
  const existing = await Enrollment.findOne({ course: courseId, user: userId });
  if (existing) throw new AppError(httpStatus.FORBIDDEN, "You Enrolled Before");

  const now = new Date();
  const res = await Enrollment.create({
    course: courseId, user: userId, status: "enrolled", instructor: instructor,
    progress: 0, startedAt: now, lastActivityAt: now
  });
  return res
};

const getMyEnrollment = async (courseId: string, userId: string) => {
  await ensureCourse(courseId);
  const doc = await Enrollment.findOne({ course: courseId, user: userId, isDeleted: false });
  if (!doc) throw new AppError(httpStatus.NOT_FOUND, "Enrollment Not Found");
  return doc;
};

const listMyEnrollments = async (userId: string) =>
  Enrollment.find({ user: userId, isDeleted: false }).populate("course").sort({ updatedAt: -1 });

const listCourseEnrollments = async (courseId: string, actor: { userId: string; role: string }) => {
  const course = await ensureCourse(courseId);
  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
  return Enrollment.find({ course: courseId, isDeleted: false }).populate("user").sort({ createdAt: -1 });
};

const updateStatus = async (
  actor: { userId: string; role: string },
  payload: JwtPayload
) => {
  const {courseId, enrollmentId, status, totalPoints} = payload

  const course = await ensureCourse(courseId);
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    course: courseId,
    isDeleted: false
  });
  if (!enrollment) throw new AppError(httpStatus.NOT_FOUND, "Enrollment Not Found");

  const isSelf = String(enrollment.user) === String(actor.userId);
  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!(isSelf || isOwner || isAdmin)) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

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

    await BadgeServices.autoIssueBadge({
      totalPoints: totalPoints,
      userId: String(enrollment.user),
      courseId: String(courseId)
    });
  }

  enrollment.lastActivityAt = new Date();
  await enrollment.save();
  return enrollment;
};


const updateProgress = async (courseId: string, enrollmentId: string, actor: { userId: string; role: string }, progress: number) => {
  const course = await ensureCourse(courseId);
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, course: courseId, isDeleted: false });
  if (!enrollment) throw new AppError(httpStatus.NOT_FOUND, "Enrollment Not Found");

  const isSelf = String(enrollment.user) === String(actor.userId);
  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!(isSelf || isOwner || isAdmin)) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  enrollment.progress = progress;
  if (progress >= 100 && enrollment.status !== "completed") {
    enrollment.status = "completed"; enrollment.completedAt = new Date();
  }
  enrollment.lastActivityAt = new Date();
  await enrollment.save();
  return enrollment;
};

// Comprehensive progress calculation including lessons, tasks, and quizzes
const calculateComprehensiveProgress = async (courseId: string, userId: string) => {
  const course = await ensureCourse(courseId);

  const units = await import("../unit/unit.model").then(mod => mod.Unit.find({ course: courseId, isDeleted: false }));

  // Get total lessons count
  const { Lesson } = await import("../lesson/lesson.model");
  const totalLessons = await Lesson.countDocuments({
    unit: { $in: units.map(u => u._id) },
    isDeleted: false
  });


  // Get total tasks count (excluding quizzes since they're handled separately)
  const { Task } = await import("../task/task.model");
  const totalTasks = await Task.countDocuments({
    unit: { $in: units.map(u => u._id) },
    type: { $nin: ["quiz"] },
    isDeleted: false
  });

  // Get total quizzes count
  const totalQuizzes = await Task.countDocuments({
    unit: { $in: units.map(u => u._id) },
    type: "quiz",
    isDeleted: false
  });

  // Get enrollment data
  const enrollment = await Enrollment.findOne({
    course: courseId,
    user: userId,
    isDeleted: false
  });

  console.log("enrollment", enrollment);

  const completedLessons = enrollment?.completedLessons?.length || 0;

  // Get submitted tasks count (excluding quizzes)
  const { TaskSubmission } = await import("../submission/submission.model");
  const submittedTasks = await TaskSubmission.countDocuments({
    course: courseId,
    user: userId,
    type: "task",
    status: { $in: ["approved", "auto_scored", "pending_review"] }
  });

  // Get submitted quizzes count
  const submittedQuizzes = await TaskSubmission.countDocuments({
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
};

const completeLesson = async (courseId: string, enrollmentId: string, actor: { userId: string; role: string }, lessonId: string) => {
  const course = await ensureCourse(courseId);
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, course: courseId, isDeleted: false });

  if (!enrollment) throw new AppError(httpStatus.NOT_FOUND, "Enrollment Not Found");

  const isSelf = String(enrollment.user) === String(actor.userId);
  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!(isSelf || isOwner || isAdmin)) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Check if lesson was already completed to avoid duplicate points
  const wasAlreadyCompleted = enrollment.completedLessons?.includes(lessonId);

  // Add lesson to completed lessons if not already there
  if (!wasAlreadyCompleted) {
    enrollment.completedLessons = enrollment.completedLessons || [];
    enrollment.completedLessons.push(lessonId);
    await enrollment.save();

    // Award points for completing lesson
    const { GamificationServices } = await import("../gamification/gamification.service");
    await GamificationServices.addPoints({
      userId: String(enrollment.user),
      points: 10, // Default points for lesson completion
      sourceType: "lesson",
      courseId: courseId,
      lessonId: lessonId,
      reason: "Lesson completion"
    });
  }

  // Calculate comprehensive progress including lessons, tasks, and quizzes
  const progressData = await calculateComprehensiveProgress(courseId, String(enrollment.user));
 
  enrollment.progress = progressData.progress;

  enrollment.lastActivityAt = new Date();
  await enrollment.save();

  return enrollment;
};

const updateTimeSpent = async (courseId: string, enrollmentId: string, actor: { userId: string; role: string }, timeSpent: number) => {
  const course = await ensureCourse(courseId);
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, course: courseId, isDeleted: false });

  if (!enrollment) throw new AppError(httpStatus.NOT_FOUND, "Enrollment Not Found");

  const isSelf = String(enrollment.user) === String(actor.userId);
  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!(isSelf || isOwner || isAdmin)) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  enrollment.timeSpent = (enrollment.timeSpent || 0) + timeSpent;
  enrollment.lastActivityAt = new Date();
  await enrollment.save();

  return enrollment;
};

// Get total points earned by user in a course
const getUserCoursePoints = async (courseId: string, userId: string) => {
  const { PointLog } = await import("../gamification/gamification.model");
  const { Types } = await import("mongoose");

  const result = await PointLog.aggregate([
    { $match: { course: new Types.ObjectId(courseId), user: new Types.ObjectId(userId) } },
    { $group: { _id: null, totalPoints: { $sum: "$points" } } }
  ]);

  return result[0]?.totalPoints || 0;
};


const getEnrolledStudentsByInstructor = async (instructorId: string) => {
  
  const studentsWithPoints = await Enrollment.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
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
    throw new AppError(httpStatus.NOT_FOUND, "Enrollment Not Found");
  }

  return studentsWithPoints;
};
export const EnrollmentServices = {
  enrollSelf, getMyEnrollment, listMyEnrollments, listCourseEnrollments, updateStatus, updateProgress, completeLesson, updateTimeSpent,
  calculateComprehensiveProgress, getUserCoursePoints, getEnrolledStudentsByInstructor
};
