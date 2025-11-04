import { Types } from "mongoose";

export type PointSourceType = "event" | "quiz" | "task" | "manual" | "package" | "purchase" | "enrollment" | "course";

export interface IPointLog {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  points: number;                 // positive or negative, but we’ll award positives now
  sourceType: PointSourceType;
  course?: Types.ObjectId;
  event?: Types.ObjectId;
  task?: Types.ObjectId;
  reason?: string;
  createdAt?: Date;
}

export interface IPointWallet {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  totalPoints: number;            // denormalized total (fast leaderboard)
  // optional: per-course points
  byCourse?: Record<string, number>;
  updatedAt?: Date;
  createdAt?: Date;
}
