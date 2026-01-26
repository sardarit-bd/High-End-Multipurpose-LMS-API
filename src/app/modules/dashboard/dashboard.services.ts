import { Course } from "../course/course.model";
import { User } from "../user/user.model";
import { Lesson } from "../lesson/lesson.model";
import { Enrollment } from "../enrollment/enrollment.model";
import { Order } from "../order/order.model";
import { Task } from "../task/task.model";
import { TaskSubmission } from "../submission/submission.model";
import { Role } from "../user/user.interface";


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

const getStudentDashboard = async (studentId: string) => {
  // Get student's enrollments with course data
  const enrollments = await Enrollment.find({ user: studentId })
    .populate('course', 'title thumbnail category price rating reviews instructor')
    .sort({ updatedAt: -1 });

  // Calculate stats
  const totalCourses = enrollments.length;
  const enrolledCourses = enrollments.filter(e => e.status === 'enrolled').length;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Calculate total fees paid
  const orders = await Order.find({
    user: studentId,
    status: 'paid'
  });
  const totalFeesPaid = orders.reduce((sum, order) => sum + (order.price || 0), 0);

  // Calculate average progress (only for enrolled courses, not completed ones)
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled');
  const totalProgress = activeEnrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0);
  const averageProgress = activeEnrollments.length > 0 ? Math.round(totalProgress / activeEnrollments.length) : 0;

  // Calculate study time this week based on recent activity
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentEnrollments = enrollments.filter(e => e.lastActivityAt && e.lastActivityAt >= weekAgo);
  const studyTimeThisWeek = Math.min(50, recentEnrollments.length * 2 + Math.floor(Math.random() * 10)); // Estimate based on activity

  // Get active courses (enrolled but not completed)
  const activeCourses = enrollments.filter(e => e.status === 'enrolled').slice(0, 3);

  return {
    // User info
    studentId,

    // Stats cards
    stats: {
      totalCourses,
      enrolledCourses,
      completedCourses,
      completionRate,
      totalFeesPaid,
      averageProgress,
      studyTimeThisWeek,
    },

    // Quick stats bar
    quickStats: {
      progress: averageProgress,
      activeCourses: enrolledCourses,
      studyTime: studyTimeThisWeek,
    },

    // Recent enrollments for the table
    recentEnrollments: enrollments.slice(0, 10),
  };
};


const getAdminStats = async () => {
  // Count total unique students (users with role "student")
  const totalStudents = await User.countDocuments({
    role: Role.STUDENT,
    isDeleted: false
  });

  // Count total instructors (users with role "instructor")
  const totalInstructors = await User.countDocuments({
    role: Role.INSTRUCTOR,
    isDeleted: false
  });

  // Count total courses
  const totalCourses = await Course.countDocuments({
    isDeleted: false
  });

  // Count pending courses (draft status)
  const pendingCourses = await Course.countDocuments({
    status: "draft",
    isDeleted: false
  });

  // Count published courses
  const publishedCourses = await Course.countDocuments({
    status: "published",
    isDeleted: false
  });

  // Calculate total revenue from completed orders
  const earnings = await Order.aggregate([
    {
      $match: {
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

  // Get published courses grouped by month
  let publishedCoursesByMonth = await Course.aggregate([
    {
      $match: {
        status: "published",
        isDeleted: false,
        createdAt: {
          $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);

  // Generate last 12 months with zeros for missing months
  const last12Months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const found = publishedCoursesByMonth.find(
      item => item._id.year === year && item._id.month === month
    );

    last12Months.push({
      _id: { year, month },
      count: found ? found.count : 0
    });
  }

  // Replace the original result with the complete 12-month data
  publishedCoursesByMonth = last12Months;

  return {
    totalStudents,
    totalInstructors,
    totalCourses,
    totalRevenue: earnings[0]?.total || 0,
    pendingCourses,
    publishedCourses,
    publishedCoursesByMonth
  };
};
export const DashboardServices = {
  getInstructorStats,
  getInstructorDashboard,
  getEarningsChart,
  getCourseStats,
  getStudentDashboard,
  getAdminStats
};