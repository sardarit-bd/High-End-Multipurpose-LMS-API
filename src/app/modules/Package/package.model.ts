import { Schema, model, models } from "mongoose";
import { IPackage } from "./package.interface";

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true }, 
    courseIds: [{ type: Schema.Types.ObjectId, ref: "Course", required: true }],
    features: [{ type: String, default: [] }],
    price: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    accessDays: { type: Number, min: 1 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

export const Package = models.Package || model<IPackage>("Package", PackageSchema);
