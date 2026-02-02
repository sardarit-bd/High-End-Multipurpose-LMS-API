import { Types } from "mongoose";

export interface IProductVariant {
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface IProduct {
  title: string;
  slug: string;
  description?: string;
  category: Types.ObjectId;
  images: string[];
  featuredImage: string;
  type: "physical" | "digital";
  price: number;
  compareAtPrice?: number;
  // sku?: string;
  // variants?: IProductVariant[];
  stock: number;
  attributes?: string[]
  shippingRequired: boolean;
  digitalUrl?: string;
  isActive: boolean;
}
