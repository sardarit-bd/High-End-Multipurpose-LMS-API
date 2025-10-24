import { Schema, model, models } from "mongoose";
import { IBadge, IUserBadge } from "./badge.interface";

const badgeSchema = new Schema<IBadge>(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    type: { type: String, enum: ["course", "event", "custom"], required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    pointsRequired: { type: Number },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, versionKey: false }
);

const userBadgeSchema = new Schema<IUserBadge>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    badge: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
    issuedAt: { type: Date, default: Date.now },
    reason: { type: String }
  },
  { timestamps: true, versionKey: false }
);

userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

export const Badge = models.Badge || model<IBadge>("Badge", badgeSchema);
export const UserBadge = models.UserBadge || model<IUserBadge>("UserBadge", userBadgeSchema);
