"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventIdParamZod = exports.updateEventZod = exports.createEventZod = void 0;
const zod_1 = __importDefault(require("zod"));
const event_interface_1 = require("./event.interface");
exports.createEventZod = zod_1.default.object({
    title: zod_1.default.string().min(1),
    description: zod_1.default.string().optional(),
    startDate: zod_1.default.string().datetime(),
    endDate: zod_1.default.string().datetime(),
    location: zod_1.default.string().optional(),
    pointsReward: zod_1.default.number().min(0).default(0),
    badgeId: zod_1.default.string().optional(),
});
exports.updateEventZod = exports.createEventZod.partial().extend({
    status: zod_1.default.enum(Object.values(event_interface_1.EventStatus)).optional(),
});
exports.eventIdParamZod = zod_1.default.object({
    eventId: zod_1.default.string().min(1),
});
