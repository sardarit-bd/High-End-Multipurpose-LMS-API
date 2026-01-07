import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Task } from "./task.model";
import { Unit } from "../unit/unit.model";
import { Course } from "../course/course.model";
import { Quiz } from "../quiz/quiz.model";
import { ITask } from "./task.interface";

const create = async (unitId: string, payload: Omit<ITask, "unit"|"course"|"isDeleted">, actor: { userId: string; role: string }) => {
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");

  const course = await Course.findById(unit.course);
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Create the task first
  const doc = await Task.create({
    unit: unit._id,
    course: course._id,
    title: payload.title,
    type: payload.type,
    description: payload.description,
    perCorrectPoint: payload.perCorrectPoint,
    maxPoints: payload.maxPoints,
    quizId: payload.quizId,
    dueDate: payload.dueDate
  });

  // If task type is "quiz", automatically create a quiz document
  if (payload.type === "quiz") {
    const quiz = await Quiz.create({
      unit: unit._id,
      course: course._id,
      task: doc._id,
      title: payload.title,
      questions: [], // Empty initially
    });

    // Update task with quizId reference
    doc.quizId = quiz._id;
    await doc.save();
  }

  return doc;
};

const listByUnit = async (unitId: string) => {
  const unit = await Unit.findById(unitId);
  if (!unit || unit.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Unit Not Found");
  return Task.find({ unit: unitId, isDeleted: false }).sort({ createdAt: 1 }).populate('quizId');
};

export const TaskServices = { create, listByUnit };
