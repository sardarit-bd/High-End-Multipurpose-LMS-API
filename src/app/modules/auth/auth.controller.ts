/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { AuthServices } from "./auth.services";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully!",
        data: loginInfo
    })

    /* use passport login */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // passport.authenticate("local", async (err: any, user: any, info: any) => {
    //   if (err) {
    //     return next(new AppError(401, err));
    //   }
    //   if (!user) {
    //     return next(new AppError(401, info.message));
    //   }


    //   delete user.toObject().password;

    //   sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "User Logged In Successfully",
    //     data: {
    //       accessToken: "userTokens.accessToken",
    //       refreshToken: "userTokens.refreshToken",
    //       user: user,
    //     },
    //   });
    // })(req, res, next);
  }
);







const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user;

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    // const tokenInfo = createUserTokens(user);
    // setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  }
);

export const AuthControllers = {
  credentialsLogin,
  googleCallbackController,
};