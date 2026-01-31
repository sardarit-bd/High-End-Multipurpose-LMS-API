import { Types } from "mongoose"

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ORGANIZATION = 'ORGANIZATION'
}

export interface IAuthProvider {
    provider: 'google' | 'credentials',
    providerId: string
}

export enum IsActive {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'
}
export type InstructorRequestStatus = "none" | "pending" | "approved" | "rejected";

export interface IInstructorRequest {
    status: InstructorRequestStatus;
    note?: string;
    requestedAt?: Date;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;
}
export interface IUser {
    _id?: Types.ObjectId,
    name: string,
    email: string,
    password?: string,
    phone?: string,
    intro?: string,
    picture?: string,
    address?: string,
    isDeleted?: boolean,
    isActive?: IsActive,
    isVerified?: boolean,
    role: Role,
    organization?: string;
    region?: string;
    auths: IAuthProvider[],
    createdAt?: Date,
    instructorRequest?: IInstructorRequest;
    socialLinks?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        github?: string;
        website?: string;
    };
    // Add student-specific fields
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    city?: Types.ObjectId;
    school?: Types.ObjectId;
    grade?: string;
    interests?: string[];
    goals?: string;
}

export interface IInstructor {
    _id?: Types.ObjectId,
    noOfCourse?: number,
    enrolledStudent?: number,
    designation: string,
    userId: Types.ObjectId,

    certifications?: string[],
    expertise?: string[],
}