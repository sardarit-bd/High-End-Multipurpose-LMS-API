import { Types } from "mongoose";

export type EnrollmentStatus = "enrolled" | "completed" | "dropped";

export interface IEnrollment {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  course: Types.ObjectId;

  status: EnrollmentStatus; // enrolled|completed|dropped
  progress: number;         // 0..100
  startedAt?: Date;
  completedAt?: Date;
  lastActivityAt?: Date;

  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
