import AppError from "../../errorHelpers/AppError";

import httpStatus from 'http-status-codes'
import { CourseCategory, ICourseCategory } from "./category.model";

const getAllCategories = async (query: any = {}) => {
  const { q, page = 1, limit = 10 } = query;
  const pageNumber = parseInt(page.toString());
  const limitNumber = parseInt(limit.toString());

  const filter: any = { isDeleted: false };

  if (q) {
    filter.title = { $regex: q, $options: 'i' };
  }

  const categories = await CourseCategory.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber);

  const total = await CourseCategory.countDocuments(filter);

  return {
    categories,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber)
  };
};

export const getCategoryById = async (id: string) => {
  const category = await CourseCategory.findOne({ _id: id, isDeleted: false });
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};

const createCategory = async (data: { title: string; image?: string }) => {
  // Check if category with same title exists
  const existingCategory = await CourseCategory.findOne({ 
    title: data.title,
    isDeleted: false 
  });
  
  if (existingCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category with this title already exists");
  }


  const category = new CourseCategory({
    title: data.title,
    image: data.image
  });

  await category.save();
  return category;
};

const updateCategory = async (id: string, updates: Partial<ICourseCategory>) => {
    console.log(id)
  const category = await CourseCategory.findOne({ _id: id, isDeleted: false });
  
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Check if new title conflicts with existing category
  if (updates.title && updates.title !== category.title) {
    const existingCategory = await CourseCategory.findOne({ 
      title: updates.title,
      isDeleted: false,
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      throw new AppError(httpStatus.BAD_REQUEST, "Category with this title already exists");
    }
  }

  Object.assign(category, updates);
  await category.save();
  return category;
};

const deleteCategory = async (id: string) => {
  const category = await CourseCategory.findOne({ _id: id, isDeleted: false });
  
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  // Soft delete
  category.isDeleted = true;
  await category.save();
  await CourseCategory.findByIdAndDelete(id)
  return category;
};

export const categoryServices = {
    createCategory,
    getAllCategories,
    getCategoryById,
    deleteCategory,
    updateCategory
}