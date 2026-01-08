"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUnitZod = exports.createUnitZod = exports.courseIdParamZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.courseIdParamZod = zod_1.default.object({
    courseId: zod_1.default.string().min(1, "courseId is required"),
});
exports.createUnitZod = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters"),
    orderIndex: zod_1.default.number().int().min(1).default(1),
    course: zod_1.default.string().min(1, "courseId is required"),
});
exports.updateUnitZod = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters").optional(),
    orderIndex: zod_1.default.number().int().min(1).optional(),
});
