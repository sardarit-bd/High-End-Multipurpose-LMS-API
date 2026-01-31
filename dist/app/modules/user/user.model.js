"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instructor = exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authProviderSchema = new mongoose_1.Schema({
    provider: {
        type: String,
        required: true
    },
    providerId: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    _id: false
});
const instructorRequestSchema = new mongoose_1.Schema({
    status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    note: { type: String },
    requestedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, { _id: false, versionKey: false });
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.STUDENT
    },
    phone: {
        type: String
    },
    picture: {
        type: String
    },
    intro: {
        type: String
    },
    address: {
        type: String
    },
    // Add student-specific fields
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    city: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'City',
        default: null
    },
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        default: null
    },
    grade: {
        type: String
    },
    interests: [{
            type: String
        }],
    goals: {
        type: String
    },
    socialLinks: {
        facebook: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        instagram: { type: String },
        github: { type: String },
        website: { type: String }
    },
    organization: { type: String },
    region: { type: String },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    auths: [authProviderSchema],
    instructorRequest: { type: instructorRequestSchema, default: { status: "none" } },
}, {
    timestamps: true,
    versionKey: false
});
exports.User = (0, mongoose_1.model)("User", userSchema);
const instructorSchema = new mongoose_1.Schema({
    designation: String,
    enrolledStudent: {
        type: Number,
        default: 0
    },
    noOfCourse: {
        type: Number,
        default: 0
    },
    certifications: [String],
    expertise: [String],
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
});
exports.Instructor = (0, mongoose_1.model)("instructor", instructorSchema);
