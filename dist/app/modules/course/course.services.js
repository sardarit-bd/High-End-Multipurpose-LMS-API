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
exports.CourseServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const course_model_1 = require("./course.model");
const lesson_model_1 = require("../lesson/lesson.model");
const unit_model_1 = require("../unit/unit.model");
const createCourse = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating course with payload:", payload);
    const course = yield course_model_1.Course.create(payload);
    return course.toObject();
});
const listCourses = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const filter = {};
    if (query.q) {
        if (((_a = query.q) === null || _a === void 0 ? void 0 : _a.length) <= 8) {
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
        const categories = query.categories.split(",");
        filter.category = { $in: categories };
    }
    // 📚 Level
    if (query.level)
        filter.level = query.level;
    // ✅ Status (published/draft)
    if (query.status)
        filter.status = query.status;
    // 👨‍🏫 Instructor
    if (query.instructor)
        filter.instructor = query.instructor;
    // 💰 Free vs Paid filter
    if (query.price === "free") {
        filter.price = 0;
    }
    else if (query.price === "paid") {
        filter.price = { $gt: 0 };
    }
    else if (typeof query.isFree === "boolean") {
        filter.price = query.isFree ? 0 : { $gt: 0 };
    }
    // 📄 Pagination and Sorting
    const page = Number((_b = query.page) !== null && _b !== void 0 ? _b : 1);
    const limit = Number((_c = query.limit) !== null && _c !== void 0 ? _c : 12);
    const skip = (page - 1) * limit;
    const sort = (_d = query.sort) !== null && _d !== void 0 ? _d : "-createdAt";
    console.log(filter);
    // ⚡ Fetch items and total count
    const [items, total] = yield Promise.all([
        course_model_1.Course.find(filter)
            .populate("instructor", "name email picture") // optional
            .sort(sort)
            .skip(skip)
            .limit(limit),
        course_model_1.Course.countDocuments(filter),
    ]);
    console.log(items);
    // Calculate lesson count and duration for each course
    const itemsWithStats = yield Promise.all(items.map((course) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const courseObj = course.toObject();
        // Get all units for this course
        const units = yield unit_model_1.Unit.find({ course: course._id, isDeleted: false }).select('_id');
        const unitIds = units.map(u => u._id);
        // Count lessons
        const lessonCount = yield lesson_model_1.Lesson.countDocuments({
            unit: { $in: unitIds },
            isDeleted: false
        });
        // Calculate total duration (sum of all lesson durations in seconds)
        const durationResult = yield lesson_model_1.Lesson.aggregate([
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
        const totalSeconds = ((_a = durationResult[0]) === null || _a === void 0 ? void 0 : _a.totalSeconds) || 0;
        // Format duration
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        let duration = "";
        if (hours > 0) {
            duration = `${hours}h`;
            if (minutes > 0) {
                duration += ` ${minutes}m`;
            }
        }
        else if (minutes > 0) {
            duration = `${minutes}m`;
        }
        else {
            duration = "0m";
        }
        return Object.assign(Object.assign({}, courseObj), { lessonCount,
            duration, totalDurationSeconds: totalSeconds });
    })));
    return {
        items: itemsWithStats,
        meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
});
const getCourseBySlug = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findOne({ slug: id, isDeleted: false });
    // const course = await Course.findOne({ _id: id, isDeleted: false });
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    return course;
});
const updateCourse = (id, updates, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findOne({ slug: id });
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    Object.assign(course, updates);
    yield course.save();
    return course;
});
const softDeleteCourse = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findById(id);
    if (!course)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    course.isDeleted = true;
    yield course.save();
    return true;
});
exports.CourseServices = {
    createCourse,
    listCourses,
    getCourseBySlug,
    updateCourse,
    softDeleteCourse,
};
