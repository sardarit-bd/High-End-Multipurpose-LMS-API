"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseCategory = void 0;
// models/category.model.ts
const mongoose_1 = require("mongoose");
const CourseCategorySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    image: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
CourseCategorySchema.index({ title: 1 }, { unique: true });
CourseCategorySchema.index({ isDeleted: 1 });
exports.CourseCategory = mongoose_1.models.CourseCategory || (0, mongoose_1.model)("CourseCategory", CourseCategorySchema);
