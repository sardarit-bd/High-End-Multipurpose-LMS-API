import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Task } from "./task.model";
import { Unit } from "../unit/unit.model";
import { Course } from "../course/course.model";
import { Quiz } from "../quiz/quiz.model";
import { ITask } from "./task.interface";

const create = async (unitId: string, payload: Omit<ITask, "unit"|"course"|"isDeleted"|"perCorrectPoint">, actor: { userId: string; role: string }) => {
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

const update = async (taskId: string, payload: Partial<ITask>, actor: { userId: string; role: string }) => {
  const task = await Task.findById(taskId);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");

  const course = await Course.findById(task.course);
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // Store original type to check if it's changing
  const originalType = task.type;
  const newType = payload.type !== undefined ? payload.type : task.type;

  // Handle type change: if changing FROM quiz TO something else, delete the quiz
  if (originalType === "quiz" && newType !== "quiz" && task.quizId) {
    const quiz = await Quiz.findById(task.quizId);
    if (quiz && !quiz.isDeleted) {
      quiz.isDeleted = true;
      await quiz.save();
    }
    task.quizId = null as any; // Clear quizId reference
  }

  // Handle type change: if changing TO quiz, create a quiz if it doesn't exist
  if (originalType !== "quiz" && newType === "quiz" && !task.quizId) {
    const quiz = await Quiz.create({
      unit: task.unit,
      course: task.course,
      task: task._id,
      title: payload.title || task.title,
      questions: [], // Empty initially
    });
    task.quizId = quiz._id;
  }

  // If type is quiz and title is being updated, update quiz title too
  if (newType === "quiz" && payload.title !== undefined && task.quizId) {
    const quiz = await Quiz.findById(task.quizId);
    if (quiz && !quiz.isDeleted) {
      quiz.title = payload.title;
      await quiz.save();
    }
  }

  // Update task fields
  if (payload.title !== undefined) task.title = payload.title;
  if (payload.description !== undefined) task.description = payload.description;
  if (payload.type !== undefined) task.type = payload.type;
  if (payload.dueDate !== undefined) task.dueDate = payload.dueDate;
  if (payload.maxPoints !== undefined) task.maxPoints = payload.maxPoints;

  await task.save();
  return await task.populate('quizId');
};

const remove = async (taskId: string, actor: { userId: string; role: string }) => {
  const task = await Task.findById(taskId);
  if (!task || task.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Task Not Found");

  const course = await Course.findById(task.course);
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  // If task type is quiz, also delete the associated quiz
  if (task.type === "quiz" && task.quizId) {
    const quiz = await Quiz.findById(task.quizId);
    if (quiz && !quiz.isDeleted) {
      quiz.isDeleted = true;
      await quiz.save();
    }
  }

  // Soft delete task
  task.isDeleted = true;
  await task.save();
  return task;
};

export const TaskServices = { create, listByUnit, update, remove };
