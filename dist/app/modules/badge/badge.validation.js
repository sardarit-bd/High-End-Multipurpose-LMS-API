"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeIdParamZod = exports.updateBadgeZod = exports.createBadgeZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createBadgeZod = zod_1.default.object({
    title: zod_1.default.string().min(1),
    description: zod_1.default.string().optional(),
    image: zod_1.default.string().url().optional(),
    type: zod_1.default.enum(["course", "event", "custom"]),
    courseId: zod_1.default.string().optional(),
    eventId: zod_1.default.string().optional(),
    pointsRequired: zod_1.default.number().optional(),
});
exports.updateBadgeZod = exports.createBadgeZod.partial();
exports.badgeIdParamZod = zod_1.default.object({
    badgeId: zod_1.default.string().min(1),
});
