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
exports.CategoryServices = void 0;
const category_model_1 = require("./category.model");
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createCategory = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield category_model_1.Category.findOne({ slug: payload.slug });
    if (exist)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Category already exists");
    return category_model_1.Category.create(payload);
});
const listCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    return category_model_1.Category.find({ isActive: true }).sort({ order: 1, name: 1 });
});
const updateCategory = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const cat = yield category_model_1.Category.findByIdAndUpdate(id, payload, { new: true });
    if (!cat)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    return cat;
});
const removeCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const cat = yield category_model_1.Category.findByIdAndDelete(id);
    if (!cat)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Category not found");
    return cat;
});
exports.CategoryServices = {
    createCategory,
    listCategories,
    updateCategory,
    removeCategory,
};
