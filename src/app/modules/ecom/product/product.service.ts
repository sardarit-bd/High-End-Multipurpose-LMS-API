import { Product } from "./product.model";
import AppError from "../../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createProduct = async (payload: any) => {
  const exist = await Product.findOne({ slug: payload.slug });
  if (exist) throw new AppError(httpStatus.BAD_REQUEST, "Product slug already exists");
  return Product.create(payload);
};

const listProducts = async (query: any) => {
  const filter: any = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.q) filter["title"] = new RegExp(query.q, "i");

  const sort: any = {};
  if (query.sort === "price") sort.price = 1;
  else if (query.sort === "-price") sort.price = -1;
  else sort.createdAt = -1;

  return Product.find(filter).sort(sort).limit(Number(query.limit) || 50).populate("category");
};

const getProduct = async (slug: string) => {
  const product = await Product.findOne({ slug, isActive: true }).populate("category");
  if (!product) throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  return product;
};

export const ProductServices = { createProduct, listProducts, getProduct };
