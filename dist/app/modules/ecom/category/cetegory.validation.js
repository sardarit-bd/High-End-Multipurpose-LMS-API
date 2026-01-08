"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createCategoryZod = zod_1.default.object({
    name: zod_1.default.string().min(2),
    slug: zod_1.default.string().min(2),
    parent: zod_1.default.string().optional(),
    isActive: zod_1.default.boolean().optional(),
    order: zod_1.default.number().optional(),
});
