import { Schema, model, models } from "mongoose";
import { IEvent} from "./event.interface";

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true }, 
    description: { type: String },
    duration: { type: Number, required: true },
    eventDate: { type: Date, required: true },
    location: { type: String },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    price: { type: Number, required: true },
    pointsReward: { type: Number, default: 0 },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
     thumbnail: { type: String },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

export const Event = models.Event || model<IEvent>("Event", eventSchema);
