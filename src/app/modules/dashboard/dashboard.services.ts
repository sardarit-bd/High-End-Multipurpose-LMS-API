import { Course } from "../course/course.model";
import { User } from "../user/user.model";
import { Lesson } from "../lesson/lesson.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { Order } from "../order/order.model";
import { Task } from "../task/task.model";
import { TaskSubmission } from "../submission/submission.model";


const getInstructorStats = async (instructorId: string) => {
  // Count live courses
  const liveCourses = await Course.countDocuments({
    instructor: instructorId,
    status: "published"
  });

  // Count total videos (lessons with video content)
  const totalVideos = await Lesson.countDocuments({
    course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') },
    contentType: "video"
  });

  // Count total students (unique enrollments)
  const totalStudents = await Enrollment.distinct("student", {
    course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') }
  });

  // Calculate total earnings
  const earnings = await Order.aggregate([
    {
      $match: {
        course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') },
        status: "completed"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  return {
    liveCourses,
    totalVideos,
    totalStudents: totalStudents.length,
    totalEarnings: earnings[0]?.total || 0
  };
};

const getInstructorDashboard = async (instructorId: string) => {
  // Get top courses with subscriber counts
  const topCourses = await Course.aggregate([
    { $match: { instructor: instructorId, status: "published" } },
    {
      $lookup: {
        from: "enrollments",
        localField: "_id",
        foreignField: "course",
        as: "enrollments"
      }
    },
    {
      $addFields: {
        subscriberCount: { $size: "$enrollments" }
      }
    },
    { $sort: { subscriberCount: -1 } },
    { $limit: 3 },
    {
      $project: {
        title: 1,
        code: "$_id",
        price: 1,
        subscriberCount: 1
      }
    }
  ]);

  // Get recent submissions
  const recentSubmissions = await TaskSubmission.find({
    instructor: instructorId
  })
  .populate('user', 'name')
  .populate('task', 'title')
  .sort({ createdAt: -1 })
  .limit(3)
  .select('user task createdAt');

  // Get unevaluated tasks
  const unevaluatedTasks = await Task.aggregate([
    {
      $match: {
        course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') }
      }
    },
    {
      $lookup: {
        from: "tasksubmissions",
        localField: "_id",
        foreignField: "task",
        as: "submissions"
      }
    },
    {
      $addFields: {
        pendingCount: {
          $size: {
            $filter: {
              input: "$submissions",
              as: "submission",
              cond: { $eq: ["$$submission.status", "pending_review"] }
            }
          }
        }
      }
    },
    {
      $match: { pendingCount: { $gt: 0 } }
    },
    {
      $project: {
        title: 1,
        pendingCount: 1
      }
    },
    { $limit: 3 }
  ]);

  return {
    topCourses,
    recentSubmissions,
    unevaluatedTasks
  };
};

const getEarningsChart = async (instructorId: string) => {
  // Get earnings data for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const earningsData = await Order.aggregate([
    {
      $match: {
        course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') },
        status: "completed",
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalEarnings: { $sum: "$amount" }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    },
    {
      $project: {
        month: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
              { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
              { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
              { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
              { case: { $eq: ["$_id.month", 5] }, then: "May" },
              { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
              { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
              { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
              { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
              { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
              { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
              { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
            ],
            default: "Unknown"
          }
        },
        earnings: "$totalEarnings"
      }
    }
  ]);

  // Fill in missing months with zero earnings
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const completeData = monthNames.map((month, index) => {
    const existingData = earningsData.find(item => item.month === month);
    return {
      name: month,
      earnings: existingData ? existingData.earnings : 0
    };
  });

  return completeData;
};

const getCourseStats = async (instructorId: string) => {
  const courses = await Course.find({ instructor: instructorId });

  const stats = {
    totalCourses: courses.length,
    activeCourses: courses.filter(course => course.status === 'published').length,
    pendingCourses: courses.filter(course => course.status === 'pending').length,
    draftCourses: courses.filter(course => course.status === 'draft').length,
    freeCourses: courses.filter(course => !course.price || course.price === 0).length,
    paidCourses: courses.filter(course => course.price && course.price > 0).length,
    totalStudents: 0, // Will be calculated from enrollments
    totalRevenue: 0, // Will be calculated from orders
  };

  // Calculate total students from enrollments
  const enrollments = await Enrollment.find({
    course: { $in: courses.map(c => c._id) }
  });
  stats.totalStudents = enrollments.length;

  // Calculate total revenue from completed orders
  const orders = await Order.find({
    course: { $in: courses.map(c => c._id) },
    status: 'completed'
  });
  stats.totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

  return stats;
};

export const DashboardServices = {
  getInstructorStats,
  getInstructorDashboard,
  getEarningsChart,
  getCourseStats,
};