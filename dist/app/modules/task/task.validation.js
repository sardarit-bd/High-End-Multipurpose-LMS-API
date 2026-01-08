"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitParamZod = exports.createTaskSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTaskSchema = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters"),
    description: zod_1.default.string().optional(),
    type: zod_1.default.enum(["quiz", "video", "pdf"]),
    perCorrectPoint: zod_1.default.number().int().min(0).optional(), // required if type=quiz
    maxPoints: zod_1.default.number().int().min(0).optional(),
    quizId: zod_1.default.string().optional(), // required if type=quiz
});
exports.unitParamZod = zod_1.default.object({ unitId: zod_1.default.string().min(1) });
