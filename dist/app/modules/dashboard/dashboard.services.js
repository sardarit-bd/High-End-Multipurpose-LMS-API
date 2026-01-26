"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardServices = void 0;
const course_model_1 = require("../course/course.model");
const user_model_1 = require("../user/user.model");
const lesson_model_1 = require("../lesson/lesson.model");
const enrollment_model_1 = require("../enrollment/enrollment.model");
const order_model_1 = require("../order/order.model");
const task_model_1 = require("../task/task.model");
const submission_model_1 = require("../submission/submission.model");
const user_interface_1 = require("../user/user.interface");
const getInstructorStats = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Count live courses
    const liveCourses = yield course_model_1.Course.countDocuments({
        instructor: instructorId,
        status: "published"
    });
    // Count total videos (lessons with video content)
    const totalVideos = yield lesson_model_1.Lesson.countDocuments({
        course: { $in: yield course_model_1.Course.find({ instructor: instructorId }).distinct('_id') },
        contentType: "video"
    });
    // Count total students (unique enrollments)
    const totalStudents = yield enrollment_model_1.Enrollment.distinct("student", {
        course: { $in: yield course_model_1.Course.find({ instructor: instructorId }).distinct('_id') }
    });
    // Calculate total earnings
    const earnings = yield order_model_1.Order.aggregate([
        {
            $match: {
                course: { $in: yield course_model_1.Course.find({ instructor: instructorId }).distinct('_id') },
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
        totalEarnings: ((_a = earnings[0]) === null || _a === void 0 ? void 0 : _a.total) || 0
    };
});
const getInstructorDashboard = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get top courses with subscriber counts
    const topCourses = yield course_model_1.Course.aggregate([
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
    const recentSubmissions = yield submission_model_1.TaskSubmission.find({
        instructor: instructorId
    })
        .populate('user', 'name')
        .populate('task', 'title')
        .sort({ createdAt: -1 })
        .limit(3)
        .select('user task createdAt');
    // Get unevaluated tasks
    const unevaluatedTasks = yield task_model_1.Task.aggregate([
        {
            $match: {
                course: { $in: yield course_model_1.Course.find({ instructor: instructorId }).distinct('_id') }
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
});
const getEarningsChart = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get earnings data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const earningsData = yield order_model_1.Order.aggregate([
        {
            $match: {
                course: { $in: yield course_model_1.Course.find({ instructor: instructorId }).distinct('_id') },
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
});
const getCourseStats = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield course_model_1.Course.find({ instructor: instructorId });
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
    const enrollments = yield enrollment_model_1.Enrollment.find({
        course: { $in: courses.map(c => c._id) }
    });
    stats.totalStudents = enrollments.length;
    // Calculate total revenue from completed orders
    const orders = yield order_model_1.Order.find({
        course: { $in: courses.map(c => c._id) },
        status: 'completed'
    });
    stats.totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    return stats;
});
const getStudentDashboard = (studentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Get student's enrollments with course data
    const enrollments = yield enrollment_model_1.Enrollment.find({ user: studentId })
        .populate('course', 'title thumbnail category price rating reviews instructor')
        .sort({ updatedAt: -1 });
    // Calculate stats
    const totalCourses = enrollments.length;
    const enrolledCourses = enrollments.filter(e => e.status === 'enrolled').length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
    // Calculate total fees paid
    const orders = yield order_model_1.Order.find({
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
});
const getAdminStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Count total unique students (users with role "student")
    const totalStudents = yield user_model_1.User.countDocuments({
        role: user_interface_1.Role.STUDENT,
        isDeleted: false
    });
    // Count total instructors (users with role "instructor")
    const totalInstructors = yield user_model_1.User.countDocuments({
        role: user_interface_1.Role.INSTRUCTOR,
        isDeleted: false
    });
    // Count total courses
    const totalCourses = yield course_model_1.Course.countDocuments({
        isDeleted: false
    });
    // Count pending courses (draft status)
    const pendingCourses = yield course_model_1.Course.countDocuments({
        status: "draft",
        isDeleted: false
    });
    // Count published courses
    const publishedCourses = yield course_model_1.Course.countDocuments({
        status: "published",
        isDeleted: false
    });
    // Calculate total revenue from completed orders
    const earnings = yield order_model_1.Order.aggregate([
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
    let publishedCoursesByMonth = yield course_model_1.Course.aggregate([
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
        const found = publishedCoursesByMonth.find(item => item._id.year === year && item._id.month === month);
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
        totalRevenue: ((_a = earnings[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
        pendingCourses,
        publishedCourses,
        publishedCoursesByMonth
    };
});
exports.DashboardServices = {
    getInstructorStats,
    getInstructorDashboard,
    getEarningsChart,
    getCourseStats,
    getStudentDashboard,
    getAdminStats
};
