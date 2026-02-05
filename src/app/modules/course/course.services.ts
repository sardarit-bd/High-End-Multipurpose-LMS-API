/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { FilterQuery } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Course } from "./course.model";
import { ICourse, ICourseListQuery } from "./course.interface";
import { Lesson } from "../lesson/lesson.model";
import { Unit } from "../unit/unit.model";

const createCourse = async (payload: Omit<ICourse, "slug" | "isDeleted">) => {
  console.log("Creating course with payload:", payload);
  const course = await Course.create(payload);
  return course.toObject();
};

const listCourses = async (query: any) => {
  const filter: FilterQuery<ICourse> = {  };

  
if(query.q){
   if (query.q?.length <= 8) {
    const searchRegex = new RegExp(query.q, 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex }
    ];
  }
  else {
    filter.$text = { $search: query.q };
  }
}

  // 🎯 Category (support single or multiple)
  
  if (query.categories) {
    const categories = query.categories.split(",")
    filter.category = { $in: categories };
  }

  // 📚 Level
  if (query.level) filter.level = query.level;

  // ✅ Status (published/draft)
  if (query.status) filter.status = query.status;

  // 👨‍🏫 Instructor
  if (query.instructor) filter.instructor = query.instructor as any;

  // 💰 Free vs Paid filter
  if (query.price === "free") {
    filter.price = 0;
  } else if (query.price === "paid") {
    filter.price = { $gt: 0 };
  } else if (typeof query.isFree === "boolean") {
    filter.price = query.isFree ? 0 : { $gt: 0 };
  }

  // 📄 Pagination and Sorting
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 12);
  const skip = (page - 1) * limit;
  const sort = query.sort ?? "-createdAt";

  console.log(filter)
  // ⚡ Fetch items and total count
  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate("instructor", "name email picture") // optional
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  console.log(items)
  // Calculate lesson count and duration for each course
  const itemsWithStats = await Promise.all(
    items.map(async (course) => {
      const courseObj = course.toObject();
      
      // Get all units for this course
      const units = await Unit.find({ course: course._id, isDeleted: false }).select('_id');
      const unitIds = units.map(u => u._id);
      
      // Count lessons
      const lessonCount = await Lesson.countDocuments({
        unit: { $in: unitIds },
        isDeleted: false
      });
      
      // Calculate total duration (sum of all lesson durations in seconds)
      const durationResult = await Lesson.aggregate([
        {
          $match: {
            unit: { $in: unitIds },
            isDeleted: false,
            durationSec: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            totalSeconds: { $sum: "$durationSec" }
          }
        }
      ]);
      
      const totalSeconds = durationResult[0]?.totalSeconds || 0;
      
      // Format duration
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      let duration = "";
      if (hours > 0) {
        duration = `${hours}h`;
        if (minutes > 0) {
          duration += ` ${minutes}m`;
        }
      } else if (minutes > 0) {
        duration = `${minutes}m`;
      } else {
        duration = "0m";
      }
      
      return {
        ...courseObj,
        lessonCount,
        duration,
        totalDurationSeconds: totalSeconds
      };
    })
  );

  return {
    items: itemsWithStats,
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
  const course = await Course.findOne({slug: id});
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
