import { Types } from "mongoose";


export interface IEvent {
  _id?: Types.ObjectId;
  title: string;
  thumbnail?: string;
  description?: string;
  eventDate: Date;
  location?: string;
  pointsReward: number;
  organizer?: Types.ObjectId;
  price: number;
  duration: number;
  attendees?: Types.ObjectId[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
