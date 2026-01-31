// app/modules/school/school.interface.ts
import { Document, Types } from 'mongoose';
import { ICity } from '../city/city.interface';

export interface ISchool extends Document {
  name: string;
  code?: string;
  address?: string;
  city: Types.ObjectId | ICity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}