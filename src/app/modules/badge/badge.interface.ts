import { Types } from "mongoose";

export type BadgeType = "course" | "event" | "custom";

export interface IBadge {
  _id?: Types.ObjectId;
  title: string;       
  description?: string;
  image?: string;                      
  type: BadgeType;
  courseId?: Types.ObjectId;
  eventId?: Types.ObjectId;
  pointsRequired?: number;             
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserBadge {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  badge: Types.ObjectId;
  issuedAt: Date;
  reason?: string;
}
