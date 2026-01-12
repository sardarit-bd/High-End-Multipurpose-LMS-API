"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourseQueryZodSchema = exports.updateCourseZodSchema = exports.createCourseZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const scoringZ = zod_1.default.object({
    quizCorrectPoint: zod_1.default.number().int().min(0).default(5),
    attendancePoint: zod_1.default.number().int().min(0).default(10),
});
exports.createCourseZodSchema = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters"),
    description: zod_1.default.string().optional(),
    price: zod_1.default.number().min(0).optional(),
    level: zod_1.default.enum(["beginner", "intermediate", "advanced"]).optional(),
    category: zod_1.default.string().optional(),
    language: zod_1.default.string().optional(),
    thumbnail: zod_1.default.string().url().optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
    status: zod_1.default.enum(["draft", "published"]).optional(),
    scoring: scoringZ.optional(),
    awardOnComplete: zod_1.default.string().optional(),
    introVideo: zod_1.default.string().optional()
});
exports.updateCourseZodSchema = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters").optional(),
    description: zod_1.default.string().optional(),
    price: zod_1.default.number().min(0).optional(),
    level: zod_1.default.enum(["beginner", "intermediate", "advanced"]).optional(),
    category: zod_1.default.string().optional(),
    language: zod_1.default.string().optional(),
    thumbnail: zod_1.default.string().url().optional(),
    tags: zod_1.default.array(zod_1.default.string()).optional(),
    status: zod_1.default.enum(["draft", "published"]).optional(),
    scoring: scoringZ.optional(),
    awardOnComplete: zod_1.default.string().optional()
});
exports.listCourseQueryZodSchema = zod_1.default.object({
    q: zod_1.default.string().optional(),
    category: zod_1.default.string().optional(),
    level: zod_1.default.enum(["beginner", "intermediate", "advanced"]).optional(),
    status: zod_1.default.enum(["draft", "published"]).optional(),
    minPrice: zod_1.default.coerce.number().min(0).optional(),
    maxPrice: zod_1.default.coerce.number().min(0).optional(),
    instructor: zod_1.default.string().optional(),
    sort: zod_1.default.string().optional(),
    page: zod_1.default.coerce.number().int().min(1).optional().default(1),
    limit: zod_1.default.coerce.number().int().min(1).max(100).optional().default(12),
});
