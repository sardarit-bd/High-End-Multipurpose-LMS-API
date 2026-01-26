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
exports.categoriesController = void 0;
const category_services_1 = require("./category.services");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const getAllCategories = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield category_services_1.categoryServices.getAllCategories(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Categories fetched successfully",
        data: result
    });
}));
const getCategory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_services_1.categoryServices.getCategoryById(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Category fetched successfully",
        data: category
    });
}));
const createCategory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_services_1.categoryServices.createCategory(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Category created successfully",
        data: category
    });
}));
const updateCategory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("updateController", req.params);
    const category = yield category_services_1.categoryServices.updateCategory(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Category updated successfully",
        data: category
    });
}));
const deleteCategory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const category = yield category_services_1.categoryServices.deleteCategory(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Category deleted successfully",
        data: category
    });
}));
exports.categoriesController = {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
