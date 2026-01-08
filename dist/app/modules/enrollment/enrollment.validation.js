"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgressZod = exports.updateStatusZod = exports.enrollmentIdParamZod = exports.courseParamZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.courseParamZod = zod_1.default.object({ courseId: zod_1.default.string().min(1) });
exports.enrollmentIdParamZod = zod_1.default.object({ courseId: zod_1.default.string().min(1), enrollmentId: zod_1.default.string().min(1) });
exports.updateStatusZod = zod_1.default.object({ status: zod_1.default.enum(["enrolled", "completed", "dropped"]) });
exports.updateProgressZod = zod_1.default.object({ progress: zod_1.default.number().int().min(0).max(100) });
