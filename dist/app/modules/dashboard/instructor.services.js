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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstructorDashboard = exports.getMonthlyEarnings = exports.getUnevaluatedTasks = exports.getRecentSubmissions = exports.getTopCourses = exports.getInstructorStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = require("../order/order.model");
const submission_model_1 = require("../submission/submission.model");
const course_model_1 = require("../course/course.model");
const enrollment_model_1 = require("../enrollment/enrollment.model");
const getInstructorStats = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const instructorObjectId = new mongoose_1.default.Types.ObjectId(instructorId);
    // Get live (published) courses count
    const liveCourses = yield course_model_1.Course.countDocuments({
        instructor: instructorObjectId,
        status: "published",
        isDeleted: false
    });
    // Get total unique students across all instructor's courses
    const enrollments = yield enrollment_model_1.Enrollment.distinct("user", {
        instructor: instructorObjectId,
        isDeleted: false
    });
    const totalStudents = enrollments.length;
    // Calculate total earnings from orders
    // First, get all course IDs for this instructor
    const instructorCourses = yield course_model_1.Course.find({ instructor: instructorObjectId, isDeleted: false }, { _id: 1 }).lean();
    const courseIds = instructorCourses.map(c => c._id.toString());
    // Then calculate total earnings from orders for those courses
    const earningsResult = yield order_model_1.Order.aggregate([
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
    const totalEarnings = ((_a = earningsResult[0]) === null || _a === void 0 ? void 0 : _a.totalEarnings) || 0;
    // Calculate average course rating (mock data since rating model not provided)
    // You can implement this with your actual rating model
    const avgRating = 4.8;
    return {
        liveCourses,
        totalStudents,
        totalEarnings,
        avgRating
    };
});
exports.getInstructorStats = getInstructorStats;
/**
 * Get top performing courses by enrollment and revenue
 */
const getTopCourses = (instructorId_1, ...args_1) => __awaiter(void 0, [instructorId_1, ...args_1], void 0, function* (instructorId, limit = 5) {
    const instructorObjectId = new mongoose_1.default.Types.ObjectId(instructorId);
    const topCourses = yield course_model_1.Course.aggregate([
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
});
exports.getTopCourses = getTopCourses;
/**
 * Get recent submissions across all instructor's courses
 */
const getRecentSubmissions = (instructorId_1, ...args_1) => __awaiter(void 0, [instructorId_1, ...args_1], void 0, function* (instructorId, limit = 10) {
    const instructorObjectId = new mongoose_1.default.Types.ObjectId(instructorId);
    const recentSubmissions = yield submission_model_1.TaskSubmission.find({
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
});
exports.getRecentSubmissions = getRecentSubmissions;
/**
 * Get unevaluated tasks (pending review submissions grouped by task)
 */
const getUnevaluatedTasks = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    const instructorObjectId = new mongoose_1.default.Types.ObjectId(instructorId);
    const unevaluatedTasks = yield submission_model_1.TaskSubmission.aggregate([
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
});
exports.getUnevaluatedTasks = getUnevaluatedTasks;
/**
 * Get monthly earnings data for chart
 */
const getMonthlyEarnings = (instructorId_1, ...args_1) => __awaiter(void 0, [instructorId_1, ...args_1], void 0, function* (instructorId, months = 12) {
    const instructorObjectId = new mongoose_1.default.Types.ObjectId(instructorId);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    // First, get all course IDs for this instructor
    const instructorCourses = yield course_model_1.Course.find({ instructor: instructorObjectId, isDeleted: false }, { _id: 1 }).lean();
    const courseIds = instructorCourses.map(c => c._id.toString());
    // Get actual earnings data
    const earningsData = yield order_model_1.Order.aggregate([
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
            earnings: (existingData === null || existingData === void 0 ? void 0 : existingData.earnings) || 0,
            orderCount: (existingData === null || existingData === void 0 ? void 0 : existingData.orderCount) || 0
        });
    }
    return result;
});
exports.getMonthlyEarnings = getMonthlyEarnings;
/**
 * Get comprehensive dashboard data in one call
 */
const getInstructorDashboard = (instructorId) => __awaiter(void 0, void 0, void 0, function* () {
    const [stats, topCourses, recentSubmissions, unevaluatedTasks, monthlyEarnings] = yield Promise.all([
        (0, exports.getInstructorStats)(instructorId),
        (0, exports.getTopCourses)(instructorId, 5),
        (0, exports.getRecentSubmissions)(instructorId, 10),
        (0, exports.getUnevaluatedTasks)(instructorId),
        (0, exports.getMonthlyEarnings)(instructorId, 12)
    ]);
    return {
        stats,
        topCourses,
        recentSubmissions,
        unevaluatedTasks,
        monthlyEarnings
    };
});
exports.getInstructorDashboard = getInstructorDashboard;
