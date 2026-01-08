"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pkgIdParamsZod = exports.updatePackageZod = exports.createPackageZod = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createPackageZod = zod_1.default.object({
    name: zod_1.default.record(zod_1.default.string()).refine(v => Object.keys(v).length > 0, "name i18n required"),
    courseIds: zod_1.default.array(zod_1.default.string().min(1)).min(1),
    features: zod_1.default.array(zod_1.default.string()).default([]),
    price: zod_1.default.number().int().min(0),
    offerPrice: zod_1.default.number().int().min(0).optional(),
    currency: zod_1.default.string().min(3).max(3).default("USD"),
    accessDays: zod_1.default.number().int().min(1).optional(),
    isActive: zod_1.default.boolean().optional()
});
exports.updatePackageZod = exports.createPackageZod.partial();
exports.pkgIdParamsZod = zod_1.default.object({ packageId: zod_1.default.string().min(1) });
