// app/modules/city/city.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CityServices } from "./city.service";

const create = catchAsync(async (req: Request, res: Response) => {
  const city = await CityServices.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "City created successfully",
    data: city,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const city = await CityServices.update(req.params.cityId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "City updated successfully",
    data: city,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const city = await CityServices.remove(req.params.cityId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "City deleted successfully",
    data: city,
  });
});

const listAll = catchAsync(async (req: Request, res: Response) => {
  const result = await CityServices.listAll(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cities retrieved successfully",
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const city = await CityServices.getById(req.params.cityId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "City retrieved successfully",
    data: city,
  });
});

const toggleStatus = catchAsync(async (req: Request, res: Response) => {
  const city = await CityServices.toggleStatus(req.params.cityId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `City ${city.isActive ? 'activated' : 'deactivated'} successfully`,
    data: city,
  });
});

export const CityController = {
  create,
  update,
  remove,
  listAll,
  getById,
  toggleStatus,
};