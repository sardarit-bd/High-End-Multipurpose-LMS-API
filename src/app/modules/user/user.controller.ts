/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { UserServices } from "./user.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUser } from "./user.interface";

const createUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await UserServices.createUser(req.body);

        sendResponse<IUser>(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User Created Successfully",
            data: user,
        });
    }
);

const getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const verifiedToken = req.user as JwtPayload;

         const user = (await UserServices.getMe(verifiedToken.userId)) as IUser;

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User Updated Successfully",
            data: user,
        });
    }
);

const getInstructor = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;

         const user = await UserServices.getInstructor(id);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Instructor is fetched Successfully",
            data: user,
        });
    }
);

const requestInstructor = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const user = await UserServices.requestInstructor(token.userId, req.body?.note);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor request submitted",
    data: user,
  });
});

const approveInstructor = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { userId } = req.body;

  const user = await UserServices.approveInstructor(userId, { userId: token.userId, role: token.role }, {
    action: req.body?.action ?? "approve",
    note: req.body?.note,
  });

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: req.body?.action === "reject" ? "Request rejected" : "User promoted to instructor",
    data: user,
  });
});
export const userController = {
    createUser,
    getMe,
    requestInstructor,
    approveInstructor,
    getInstructor
};