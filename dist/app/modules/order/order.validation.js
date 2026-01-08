"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutBodyZod = exports.courseParamZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.courseParamZod = zod_1.default.object({ courseId: zod_1.default.string().min(1) });
exports.checkoutBodyZod = zod_1.default.object({
    provider: zod_1.default.enum(["stripe", "paypal", "toyyibpay"]),
    couponCode: zod_1.default.string().optional()
});
