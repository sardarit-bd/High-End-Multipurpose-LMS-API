import { Schema, model, models } from "mongoose";
import { IEvent, EventStatus } from "./event.interface";

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true }, 
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.UPCOMING
    },
    pointsReward: { type: Number, default: 0 },
    badgeId: { type: Schema.Types.ObjectId, ref: "Badge" },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

export const Event = models.Event || model<IEvent>("Event", eventSchema);
