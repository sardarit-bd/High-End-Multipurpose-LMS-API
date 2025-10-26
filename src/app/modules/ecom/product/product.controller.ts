import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req, res) => {
  const data = await ProductServices.createProduct(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Product created", data });
});

const listProducts = catchAsync(async (req, res) => {
  const data = await ProductServices.listProducts(req.query);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Product list", data });
});

const getProduct = catchAsync(async (req, res) => {
  const data = await ProductServices.getProduct(req.params.slug);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Product detail", data });
});

export const ProductController = { createProduct, listProducts, getProduct };
