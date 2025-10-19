import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes'
import { OtpServices } from "./otp.services";

const sendOtp = catchAsync(async(req: Request, res: Response) => {
    await OtpServices.sendOtp(req.body.email, req.body.name)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP is sent to your email Successfully",
      data: null,
    });
})

const verifyOtp = catchAsync(async(req: Request, res: Response) => {
    await OtpServices.verifyOtp(req.body.email, req.body.otp)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP is verified Successfully",
      data: null,
    });
})

export const OtpController = {
    sendOtp,
    verifyOtp
}