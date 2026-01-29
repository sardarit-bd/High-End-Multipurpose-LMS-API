import mongoose from "mongoose";
import { Order } from "../order/order.model";
import { TaskSubmission } from "../submission/submission.model";
import { Course } from "../course/course.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { ICourse } from "../course/course.interface";

export const getInstructorStats = async (instructorId: string) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

  // Get live (published) courses count
  const liveCourses = await Course.countDocuments({
    instructor: instructorObjectId,
    status: "published",
    isDeleted: false
  });

  // Get total unique students across all instructor's courses
  const enrollments = await Enrollment.distinct("user", {
    instructor: instructorObjectId,
    isDeleted: false
  });
  const totalStudents = enrollments.length;

  // Calculate total earnings from orders
  // First, get all course IDs for this instructor
  const instructorCourses: any[] = await Course.find(
    { instructor: instructorObjectId, isDeleted: false },
    { _id: 1 }
  ).lean();
  
  const courseIds = instructorCourses.map(c => c._id.toString());

  // Then calculate total earnings from orders for those courses
  const earningsResult = await Order.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: "paid",
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$price" }
      }
    }
  ]);

  const totalEarnings = earningsResult[0]?.totalEarnings || 0;

  // Calculate average course rating (mock data since rating model not provided)
  // You can implement this with your actual rating model
  const avgRating = 4.8;

  return {
    liveCourses,
    totalStudents,
    totalEarnings,
    avgRating
  };
};

/**
 * Get top performing courses by enrollment and revenue
 */
export const getTopCourses = async (instructorId: string, limit: number = 5) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

  const topCourses = await Course.aggregate([
    {
      $match: {
        instructor: instructorObjectId,
        status: "published",
        isDeleted: false
      }
    },
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "course",
        as: "enrollmentData"
      }
    },
    {
      $addFields: {
        subscriberCount: {
          $size: {
            $filter: {
              input: "$enrollmentData",
              as: "enrollment",
              cond: { $eq: ["$$enrollment.isDeleted", false] }
            }
          }
        }
      }
    },
    {
      $addFields: {
        totalRevenue: { $multiply: ["$price", "$subscriberCount"] }
      }
    },
    {
      $sort: { totalRevenue: -1, subscriberCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        title: 1,
        price: 1,
        subscriberCount: 1,
        totalRevenue: 1,
        thumbnail: 1,
        slug: 1,
        _id: 1
      }
    }
  ]);

  return topCourses;
};

/**
 * Get recent submissions across all instructor's courses
 */
export const getRecentSubmissions = async (instructorId: string, limit: number = 10) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

  const recentSubmissions = await TaskSubmission.find({
    instructor: instructorObjectId,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name email picture")
    .populate("course", "title thumbnail")
    .populate("task", "title type")
    .lean();

  return recentSubmissions;
};

/**
 * Get unevaluated tasks (pending review submissions grouped by task)
 */
export const getUnevaluatedTasks = async (instructorId: string) => {
  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);

  const unevaluatedTasks = await TaskSubmission.aggregate([
    {
      $match: {
        instructor: instructorObjectId,
        status: "pending_review"
      }
    },
    {
      $lookup: {
        from: "tasks",
        localField: "task",
        foreignField: "_id",
        as: "taskData"
      }
    },
    {
      $unwind: "$taskData"
    },
    {
      $group: {
        _id: "$task",
        title: { $first: "$taskData.title" },
        type: { $first: "$taskData.type" },
        pendingCount: { $sum: 1 },
        oldestSubmission: { $min: "$createdAt" }
      }
    },
    {
      $sort: { pendingCount: -1, oldestSubmission: 1 }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 1,
        title: 1,
        type: 1,
        pendingCount: 1,
        oldestSubmission: 1
      }
    }
  ]);

  return unevaluatedTasks;
};

/**
 * Get monthly earnings data for chart
 */
export const getMonthlyEarnings = async (instructorId: string, months: number = 12) => {
 const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // First, get all course IDs for this instructor
  const instructorCourses: any[]= await Course.find(
    { instructor: instructorObjectId, isDeleted: false },
    { _id: 1 }
  ).lean();
  
  const courseIds = instructorCourses.map(c => c._id.toString());

  // Get actual earnings data
  const earningsData = await Order.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: "paid",
        isDeleted: false,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        earnings: { $sum: "$price" },
        orderCount: { $sum: 1 }
      }
    }
  ]);

  // Create a map of existing data
  const dataMap = new Map();
  earningsData.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    dataMap.set(key, {
      earnings: item.earnings,
      orderCount: item.orderCount
    });
  });

  // Generate all months for the last 12 months
  const result = [];
  const currentDate = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    const existingData = dataMap.get(monthKey);
    
    result.push({
      month: monthKey,
      earnings: existingData?.earnings || 0,
      orderCount: existingData?.orderCount || 0
    });
  }

  return result
};

/**
 * Get comprehensive dashboard data in one call
 */
export const getInstructorDashboard = async (instructorId: string) => {
  const [stats, topCourses, recentSubmissions, unevaluatedTasks, monthlyEarnings] = await Promise.all([
    getInstructorStats(instructorId),
    getTopCourses(instructorId, 5),
    getRecentSubmissions(instructorId, 10),
    getUnevaluatedTasks(instructorId),
    getMonthlyEarnings(instructorId, 12)
  ]);

  return {
    stats,
    topCourses,
    recentSubmissions,
    unevaluatedTasks,
    monthlyEarnings
  };
};