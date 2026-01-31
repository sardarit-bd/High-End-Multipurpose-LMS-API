// app/modules/city/city.model.ts
import mongoose, { Schema } from 'mongoose';
import { ICity } from './city.interface';

const citySchema = new Schema<ICity>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create indexes
citySchema.index({ name: 1, country: 1 }, { unique: true });
citySchema.index({ isActive: 1 });

const City = mongoose.model<ICity>('City', citySchema);

export default City;