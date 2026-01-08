"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmissionZod = exports.createReviewedSubmissionZod = exports.taskIdParamZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.taskIdParamZod = zod_1.default.object({ taskId: zod_1.default.string().min(1) });
exports.createReviewedSubmissionZod = zod_1.default.object({
    artifactUrl: zod_1.default.string().url(),
    note: zod_1.default.string().max(500).optional()
});
// Instructor grading body
exports.gradeSubmissionZod = zod_1.default.object({
    pointsAwarded: zod_1.default.number().int().min(0),
    status: zod_1.default.enum(["approved", "rejected"])
});
