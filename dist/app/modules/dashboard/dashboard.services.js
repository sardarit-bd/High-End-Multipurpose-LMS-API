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
const lesson_model_1 = require("../lesson/lesson.model");
const enrollment_model_1 = require("../enrollment/enrollment.model");
const order_model_1 = require("../order/order.model");
const task_model_1 = require("../task/task.model");
const submission_model_1 = require("../submission/submission.model");
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
exports.DashboardServices = {
    getInstructorStats,
    getInstructorDashboard,
    getEarningsChart,
    getCourseStats,
};
