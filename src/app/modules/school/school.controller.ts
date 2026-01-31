// app/modules/school/school.controller.ts
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SchoolServices } from "./schoole.service";


const create = catchAsync(async (req: Request, res: Response) => {
  const school = await SchoolServices.create(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "School created successfully",
    data: school,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const school = await SchoolServices.update(req.params.schoolId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School updated successfully",
    data: school,
  });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const school = await SchoolServices.remove(req.params.schoolId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School deleted successfully",
    data: school,
  });
});

const listAll = catchAsync(async (req: Request, res: Response) => {
  const result = await SchoolServices.listAll(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schools retrieved successfully",
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const school = await SchoolServices.getById(req.params.schoolId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "School retrieved successfully",
    data: school,
  });
});

const toggleStatus = catchAsync(async (req: Request, res: Response) => {
  const school = await SchoolServices.toggleStatus(req.params.schoolId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `School ${school.isActive ? 'activated' : 'deactivated'} successfully`,
    data: school,
  });
});

export const SchoolController = {
  create,
  update,
  remove,
  listAll,
  getById,
  toggleStatus,
};