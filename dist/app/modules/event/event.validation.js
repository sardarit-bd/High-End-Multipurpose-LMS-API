"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventIdParamZod = exports.createEventZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createEventZod = zod_1.default.object({
    title: zod_1.default.string().min(1),
    description: zod_1.default.string().optional(),
    startDate: zod_1.default.string().datetime(),
    endDate: zod_1.default.string().datetime(),
    location: zod_1.default.string().optional(),
    pointsReward: zod_1.default.number().min(0).default(0),
    badgeId: zod_1.default.string().optional(),
});
exports.eventIdParamZod = zod_1.default.object({
    eventId: zod_1.default.string().min(1),
});
