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
exports.UnitServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const unit_model_1 = require("./unit.model");
const course_model_1 = require("../course/course.model"); // adjust if your Course model path differs
const createUnit = (payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { course: courseId } = payload;
    console.log("Creating unit for courseId:", payload);
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    const doc = yield unit_model_1.Unit.create({
        course: course._id,
        title: payload.title,
        orderIndex: (_a = payload.orderIndex) !== null && _a !== void 0 ? _a : 1,
    });
    return doc;
});
const listUnits = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    return unit_model_1.Unit.find({ course: courseId, isDeleted: false })
        .sort({ orderIndex: 1, createdAt: 1 });
});
const updateUnit = (unitId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const unit = yield unit_model_1.Unit.findById(unitId);
    if (!unit || unit.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Unit Not Found");
    const course = yield course_model_1.Course.findById(unit.course);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const isOwner = String(course.instructor) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    const updated = yield unit_model_1.Unit.findByIdAndUpdate(unitId, Object.assign(Object.assign({}, payload), { updatedAt: new Date() }), { new: true });
    return updated;
});
exports.UnitServices = { createUnit, listUnits, updateUnit };
