import { model, Schema } from "mongoose";
import { IAuthProvider, IInstructor, IInstructorRequest, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
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
})

const instructorRequestSchema = new Schema<IInstructorRequest>({
    status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    note: { type: String },
    requestedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { _id: false, versionKey: false });

const userSchema = new Schema<IUser>({
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
        enum: Object.values(Role),
        default: Role.STUDENT
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
    organization: { type: String },
    region: { type: String },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: String,
        enum: Object.values(IsActive),
        default: IsActive.ACTIVE
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
})


export const User = model<IUser>("User", userSchema)

const instructorSchema = new Schema<IInstructor>({
    designation: String,
    enrolledStudent: {
        type: Number,
        default: 0
    },
    noOfCourse: {
        type: Number,
        default: 0
    },
    noOfRatting: {
        type: Number,
        default: 0
    },
    ratting: {
        type: Number,
        default: 0
    },
    skills: {
        type: [String]
    },
    totalHr: {
        type: Number,
        default: 0
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
export const Instructor = model<IInstructor>("instructor", instructorSchema)