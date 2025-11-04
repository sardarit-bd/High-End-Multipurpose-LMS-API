import { Schema, model, models } from "mongoose";
import { IPointLog, IPointWallet } from "./gamification.interface";

const PointLogSchema = new Schema<IPointLog>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  points: { type: Number, required: true },
  sourceType: { type: String, enum: ["event","quiz","task","manual", "package", "course", "purchase"], required: true, index: true },
  course: { type: Schema.Types.ObjectId, ref: "Course" },
  event: { type: Schema.Types.ObjectId, ref: "Event" },
  task: { type: Schema.Types.ObjectId, ref: "Task" },
  reason: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

PointLogSchema.index({ user: 1, createdAt: -1 });

const PointWalletSchema = new Schema<IPointWallet>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  totalPoints: { type: Number, default: 0 },
  byCourse: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true, versionKey: false });

export const PointLog = models.PointLog || model<IPointLog>("PointLog", PointLogSchema);
export const PointWallet = models.PointWallet || model<IPointWallet>("PointWallet", PointWalletSchema);
