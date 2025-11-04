import { Category } from "./category.model";
import AppError from "../../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createCategory = async (payload: any) => {
  const exist = await Category.findOne({ slug: payload.slug });
  if (exist) throw new AppError(httpStatus.BAD_REQUEST, "Category already exists");
  return Category.create(payload);
};

const listCategories = async () => {
  return Category.find({ isActive: true }).sort({ order: 1, name: 1 });
};

const updateCategory = async (id: string, payload: any) => {
  const cat = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!cat) throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  return cat;
};

const removeCategory = async (id: string) => {
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  return cat;
};

export const CategoryServices = {
  createCategory,
  listCategories,
  updateCategory,
  removeCategory,
};
