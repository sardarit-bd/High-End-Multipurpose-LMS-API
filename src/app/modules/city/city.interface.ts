// app/modules/city/city.interface.ts
import { Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}