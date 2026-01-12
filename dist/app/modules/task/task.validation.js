"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitParamZod = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTaskSchema = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters"),
    description: zod_1.default.string().optional(),
    type: zod_1.default.enum(["quiz", "video", "pdf"]),
    maxPoints: zod_1.default.number().int().min(0).optional(),
    quizId: zod_1.default.string().optional(), // required if type=quiz
});
exports.updateTaskSchema = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters").optional(),
    description: zod_1.default.string().optional(),
    type: zod_1.default.enum(["quiz", "video", "pdf"]).optional(),
    maxPoints: zod_1.default.number().int().min(0).optional(),
    quizId: zod_1.default.string().optional(),
    dueDate: zod_1.default.string().optional(),
    status: zod_1.default.enum(["draft", "active", "expired"]).optional(),
}).optional();
exports.unitParamZod = zod_1.default.object({ unitId: zod_1.default.string().min(1) });
