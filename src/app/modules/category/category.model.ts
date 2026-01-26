// models/category.model.ts
import { Schema, model, models } from "mongoose";

export interface ICourseCategory {
  title: string;
  image?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseCategorySchema = new Schema<ICourseCategory>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
    },
    image: { type: String },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

CourseCategorySchema.index({ title: 1 }, { unique: true });
CourseCategorySchema.index({ isDeleted: 1 });

export const CourseCategory = models.CourseCategory || model<ICourseCategory>("CourseCategory", CourseCategorySchema);