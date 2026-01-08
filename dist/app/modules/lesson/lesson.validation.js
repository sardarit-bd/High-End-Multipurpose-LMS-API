"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLessonZod = exports.createLessonZod = exports.unitIdParamZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.unitIdParamZod = zod_1.default.object({
    unitId: zod_1.default.string().min(1, "unitId is required"),
});
exports.createLessonZod = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters"),
    contentType: zod_1.default.enum(["video", "article", "pdf", "audio", "link"]),
    contentUrl: zod_1.default.string().url(),
    durationSec: zod_1.default.number().int().min(1).optional(),
    orderIndex: zod_1.default.number().int().min(1).default(1),
    unit: zod_1.default.string().min(1, "unitId is required")
});
exports.updateLessonZod = zod_1.default.object({
    title: zod_1.default.string().min(2, "Title must be at least 2 characters").optional(),
    contentType: zod_1.default.enum(["video", "article", "pdf", "audio", "link"]).optional(),
    contentUrl: zod_1.default.string().url().optional(),
    durationSec: zod_1.default.number().int().min(1).optional(),
    orderIndex: zod_1.default.number().int().min(1).optional(),
});
