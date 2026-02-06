import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { CategoryServices } from "./category.services";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.createCategory(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Category created", data: result });
});

const listCategories = catchAsync(async (req, res) => {
  const result = await CategoryServices.listCategories();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category list", data: result });
});

const updateCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.updateCategory(req.params.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category updated", data: result });
});

const removeCategory = catchAsync(async (req, res) => {
  const result = await CategoryServices.removeCategory(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category deleted", data: result });
});

export const CategoryController = { createCategory, listCategories, updateCategory, removeCategory };
