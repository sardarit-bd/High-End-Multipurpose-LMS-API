/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { ILesson } from "./lesson.interface";
import { Unit } from "../unit/unit.model";
import { Course } from "../course/course.model";
import { Lesson } from "./lesson.model";

const createLesson = async (
  payload: ILesson,
  actor: { userId: string; role: string }
) => {
  // Verify unit and course
  const {unit : unitId} = payload;
  console.log("unitId:", unitId);
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");

  const course = await Course.findById(unit.course);
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  // Owner or admin
  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  const doc = await Lesson.create({
    unit: unit._id,
    course: course._id,
    title: payload.title,
    contentType: payload.contentType,
    contentUrl: payload.contentUrl,
    orderIndex: payload.orderIndex ?? 1,
  });

  return doc;
};

const listLessons = async (unitId: string) => {
  // Optional: verify unit existence for a clear 404
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");

  return Lesson.find({ unit: unitId, isDeleted: false }).sort({ orderIndex: 1, createdAt: 1 });
};

export const LessonServices = { createLesson, listLessons };
