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
exports.categoryServices = exports.getCategoryById = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const category_model_1 = require("./category.model");
const getAllCategories = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q, page = 1, limit = 10 } = query;
    const pageNumber = parseInt(page.toString());
    const limitNumber = parseInt(limit.toString());
    const filter = { isDeleted: false };
    if (q) {
        filter.title = { $regex: q, $options: 'i' };
    }
    const categories = yield category_model_1.CourseCategory.find(filter)
        .sort({ createdAt: -1 })
        .limit(limitNumber)
        .skip((pageNumber - 1) * limitNumber);
    const total = yield category_model_1.CourseCategory.countDocuments(filter);
    return {
        categories,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
    };
});
const getCategoryById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.CourseCategory.findOne({ _id: id, isDeleted: false });
    if (!category) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    }
    return category;
});
exports.getCategoryById = getCategoryById;
const createCategory = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if category with same title exists
    const existingCategory = yield category_model_1.CourseCategory.findOne({
        title: data.title,
        isDeleted: false
    });
    if (existingCategory) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Category with this title already exists");
    }
    const category = new category_model_1.CourseCategory({
        title: data.title,
        image: data.image
    });
    yield category.save();
    return category;
});
const updateCategory = (id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(id);
    const category = yield category_model_1.CourseCategory.findOne({ _id: id, isDeleted: false });
    if (!category) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    }
    // Check if new title conflicts with existing category
    if (updates.title && updates.title !== category.title) {
        const existingCategory = yield category_model_1.CourseCategory.findOne({
            title: updates.title,
            isDeleted: false,
            _id: { $ne: id }
        });
        if (existingCategory) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Category with this title already exists");
        }
    }
    Object.assign(category, updates);
    yield category.save();
    return category;
});
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_model_1.CourseCategory.findOne({ _id: id, isDeleted: false });
    if (!category) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    }
    // Soft delete
    category.isDeleted = true;
    yield category.save();
    yield category_model_1.CourseCategory.findByIdAndDelete(id);
    return category;
});
exports.categoryServices = {
    createCategory,
    getAllCategories,
    getCategoryById: exports.getCategoryById,
    deleteCategory,
    updateCategory
};
