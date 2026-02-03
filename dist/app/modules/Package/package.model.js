"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Package = void 0;
const mongoose_1 = require("mongoose");
const PackageSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    courseIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true }],
    features: [{ type: String, default: [] }],
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    accessDays: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    comparePrice: { type: Number, min: 0 }
}, { timestamps: true, versionKey: false });
exports.Package = mongoose_1.models.Package || (0, mongoose_1.model)("Package", PackageSchema);
