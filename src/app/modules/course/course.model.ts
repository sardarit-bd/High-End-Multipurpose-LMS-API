import { Schema, model, models } from "mongoose";
import { ICourse } from "./course.interface";
const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category: { type: String, index: true },
    thumbnail: { type: String },
    tags: [{ type: String }],

    instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },

    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isDeleted: { type: Boolean, default: false },
    awardOnComplete: { type: Schema.Types.ObjectId, ref: "Badge" }
  },
  { timestamps: true, versionKey: false }
);

CourseSchema.index({ title: "text", description: "text", category: "text" });


CourseSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

export const Course = models.Course || model<ICourse>("Course", CourseSchema);
