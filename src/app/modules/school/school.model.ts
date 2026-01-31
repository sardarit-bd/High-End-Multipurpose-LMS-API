// app/modules/school/school.model.ts
import mongoose, { Schema } from 'mongoose';
import { ISchool } from './school.interface';

const schoolSchema = new Schema<ISchool>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create indexes
schoolSchema.index({ name: 1, city: 1 }, { unique: true });
schoolSchema.index({ code: 1 }, { unique: true, sparse: true });
schoolSchema.index({ city: 1 });
schoolSchema.index({ isActive: 1 });

const School = mongoose.model<ISchool>('School', schoolSchema);

export default School;