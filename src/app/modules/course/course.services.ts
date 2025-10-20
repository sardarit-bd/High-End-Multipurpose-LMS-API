/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { FilterQuery } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Course } from "./course.model";
import { ICourse, ICourseListQuery } from "./course.interface";

const createCourse = async (payload: Omit<ICourse, "slug" | "isDeleted">) => {
  const course = await Course.create(payload);
  return course.toObject();
};

const listCourses = async (query: ICourseListQuery) => {
  const filter: FilterQuery<ICourse> = { isDeleted: false };

  if (query.q) filter.$text = { $search: query.q };
  if (query.category) filter.category = query.category;
  if (query.level) filter.level = query.level;
  if (query.status) filter.status = query.status;
  if (query.instructor) filter.instructor = query.instructor as any;

  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {};
    if (query.minPrice != null) (filter.price as any).$gte = query.minPrice;
    if (query.maxPrice != null) (filter.price as any).$lte = query.maxPrice;
  }

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 12);
  const skip = (page - 1) * limit;
  const sort = query.sort ?? "-createdAt";

  const [items, total] = await Promise.all([
    Course.find(filter).sort(sort).skip(skip).limit(limit),
    Course.countDocuments(filter),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getCourseBySlug = async (id: string) => {
  const course = await Course.findOne({ slug: id, isDeleted: false });
    // const course = await Course.findOne({ _id: id, isDeleted: false });
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");
  return course;
};

const updateCourse = async (
  id: string,
  updates: Partial<ICourse>,
  actor: { userId: string; role: string }
) => {
  const course = await Course.findById(id);
  if (!course || course.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");

  const isOwner = String(course.instructor) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  Object.assign(course, updates);
  await course.save();
  return course;
};

const softDeleteCourse = async (id: string) => {
  const course = await Course.findById(id);
  if (!course) throw new AppError(httpStatus.NOT_FOUND, "Course Not Found");
  course.isDeleted = true;
  await course.save();
  return true;
};

export const CourseServices = {
  createCourse,
  listCourses,
  getCourseBySlug,
  updateCourse,
  softDeleteCourse,
};
