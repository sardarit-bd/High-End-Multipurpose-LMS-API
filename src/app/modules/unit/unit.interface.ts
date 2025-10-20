import { Types } from "mongoose";

export interface IUnit {
  _id?: Types.ObjectId;
  course: Types.ObjectId;                 // parent Course _id
  title: Record<string, string>;          // i18n map: { "en": "Module 1" }
  orderIndex: number;                      // display order (1..n)
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
