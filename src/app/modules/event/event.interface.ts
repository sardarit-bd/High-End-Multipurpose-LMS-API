import { Types } from "mongoose";

export enum EventStatus {
  UPCOMING = "upcoming",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface IEvent {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer?: Types.ObjectId; // Admin or Organization
  status: EventStatus;
  pointsReward: number;
  badgeId?: Types.ObjectId;
  attendees?: Types.ObjectId[];
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
