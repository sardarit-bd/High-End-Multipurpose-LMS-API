import { Types } from "mongoose";

export type EnrollmentStatus = "enrolled" | "completed" | "dropped";

export interface IEnrollment {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  course: Types.ObjectId;
  instructor: Types.ObjectId;

  status: EnrollmentStatus; // enrolled|completed|dropped
  progress: number;         // 0..100
  completedLessons?: string[]; // Array of lesson IDs that are completed
  timeSpent?: number;       // Time spent in seconds
  streak?: number;          // Current learning streak in days
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt?: Date;

  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
