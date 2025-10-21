import { Types } from "mongoose";

export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "draft" | "published";

export interface ICourse {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  level?: CourseLevel;
  category?: string;
  language?: string;
  thumbnail?: string;
  tags?: string[];

  instructor: Types.ObjectId; // owner userId
  status: CourseStatus;
  isDeleted?: boolean;

  awardOnComplete?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseListQuery {
  q?: string;
  category?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  minPrice?: number;
  maxPrice?: number;
  instructor?: string; // userId
  sort?: string;       // "-createdAt", "price", etc.
  page?: number;
  limit?: number;
}
