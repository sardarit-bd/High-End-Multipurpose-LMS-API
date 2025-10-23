import { Types } from "mongoose";

export interface IPackage {
  _id?: Types.ObjectId;
  name: string;          
  courseIds: Types.ObjectId[];           
  features: string[];                   
  price: number;                   
  offerPrice?: number;              
  currency: string;                    
  accessDays?: number;                   
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
