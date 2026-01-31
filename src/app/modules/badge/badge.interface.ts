import { Types } from "mongoose";

export interface IBadge {
  _id?: Types.ObjectId;
  title: string;       
  description?: string;
  image?: string;                      
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
