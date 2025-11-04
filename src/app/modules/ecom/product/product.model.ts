import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";;

const variantSchema = new Schema({
  name: String,
  sku: String,
  price: Number,
  stock: Number,
  attributes: { type: Schema.Types.Mixed }
}, { _id:false });

const productSchema = new Schema<IProduct>({
  title: { type: Schema.Types.Mixed, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: String,
  images: [String],
  type: { type: String, enum: ["physical","digital"], default: "physical" },
  price: Number,
  compareAtPrice: Number,
  sku: String,
  variants: [variantSchema],
  stock: { type: Number, default: 0 },
  attributes: Schema.Types.Mixed,
  shippingRequired: { type: Boolean, default: true },
  digitalUrl: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

export const Product = model<IProduct>("Product", productSchema);
