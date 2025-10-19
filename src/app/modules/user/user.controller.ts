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

        const user = await UserServices.getMe(verifiedToken.userId);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User Updated Successfully",
            data: user,
        });
    }
);


export const userController = {
    createUser,
    getMe
};