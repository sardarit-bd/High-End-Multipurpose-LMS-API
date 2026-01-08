"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderZod = exports.markDeliveredZod = exports.updateTrackingZod = exports.fulfillOrderZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.fulfillOrderZod = zod_1.default.object({
    status: zod_1.default.enum(["processing", "shipped"]).default("shipped"),
    trackingNumber: zod_1.default.string().min(2).optional(),
    carrier: zod_1.default.string().min(2).optional(),
});
exports.updateTrackingZod = zod_1.default.object({
    trackingNumber: zod_1.default.string().min(2),
    carrier: zod_1.default.string().min(2).optional(),
    status: zod_1.default.enum(["processing", "shipped"]).optional(),
});
exports.markDeliveredZod = zod_1.default.object({
    deliveredAt: zod_1.default.string().datetime().optional(), // ISO string; defaults now()
});
exports.cancelOrderZod = zod_1.default.object({
    reason: zod_1.default.string().min(3).optional(),
    restock: zod_1.default.boolean().default(true), // if paid & physical, decide policy before enabling
});
