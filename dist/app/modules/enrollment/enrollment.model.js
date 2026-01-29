"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
const mongoose_1 = require("mongoose");
const EnrollmentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    instructor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    status: { type: String, enum: ["enrolled", "completed", "dropped"], default: "enrolled" },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    completedLessons: [{ type: String }], // Array of lesson IDs that are completed
    timeSpent: { type: Number, default: 0 }, // Time spent in seconds
    streak: { type: Number, default: 0 }, // Current learning streak in days
    startedAt: { type: Date },
    completedAt: { type: Date },
    lastActivityAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
exports.Enrollment = mongoose_1.models.Enrollment || (0, mongoose_1.model)("Enrollment", EnrollmentSchema);
