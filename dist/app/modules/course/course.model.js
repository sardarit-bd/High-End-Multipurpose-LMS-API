"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const mongoose_1 = require("mongoose");
const CourseSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    noOfStudents: { type: Number, default: 0 },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category: { type: String, index: true },
    thumbnail: { type: String },
    introVideo: { type: String },
    tags: [{ type: String }],
    instructor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isDeleted: { type: Boolean, default: false },
    awardOnComplete: { type: mongoose_1.Schema.Types.ObjectId, ref: "Badge" }
}, { timestamps: true, versionKey: false });
CourseSchema.index({ title: "text", description: "text", category: "text" });
CourseSchema.pre("save", function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    next();
});
exports.Course = mongoose_1.models.Course || (0, mongoose_1.model)("Course", CourseSchema);
exports.Course.createIndexes();
