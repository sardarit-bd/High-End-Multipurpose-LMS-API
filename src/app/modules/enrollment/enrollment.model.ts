import { Schema, model, models } from "mongoose";
import { IEnrollment } from "./enrollment.interface";

const EnrollmentSchema = new Schema<IEnrollment>({
  user:   { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  status: { type: String, enum: ["enrolled","completed","dropped"], default: "enrolled" },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastActivityAt: { type: Date },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = models.Enrollment || model<IEnrollment>("Enrollment", EnrollmentSchema);
