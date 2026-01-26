// controllers/category.controller.ts
import { Request, Response } from "express";
import { categoryServices } from "./category.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes'


const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.getAllCategories(req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories fetched successfully",
    data: result
  });
});

const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryServices.getCategoryById(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category fetched successfully",
    data: category
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryServices.createCategory(req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: category
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    console.log("updateController", req.params)
  const category = await categoryServices.updateCategory(req.params.id, req.body);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully",
    data: category
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryServices.deleteCategory(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully",
    data: category
  });
});

export const categoriesController = {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};