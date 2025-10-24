/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Enrollment } from "./enrollment.model";
import { Course } from "../course/course.model";
import { BadgeServices } from "../badge/badge.service";

const ensureCourse = async (courseId: string) => {
  const course = await Course.findById(courseId);
  if (!course || (course as any).isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");
  return course;
};

// Idempotent self-enroll (used by payment success)
const enrollSelf = async (courseId: string, userId: string) => {
  await ensureCourse(courseId);
  const existing = await Enrollment.findOne({ course: courseId, user: userId });
  if (existing) return existing;

  const now = new Date();
  return Enrollment.create({
    course: courseId, user: userId, status: "enrolled",
    progress: 0, startedAt: now, lastActivityAt: now
  });
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
  courseId: string,
  enrollmentId: string,
  actor: { userId: string; role: string },
  status: "enrolled" | "completed" | "dropped"
) => {
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
    
    await BadgeServices.autoIssueBadge({
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

export const EnrollmentServices = {
  enrollSelf, getMyEnrollment, listMyEnrollments, listCourseEnrollments, updateStatus, updateProgress,
};
