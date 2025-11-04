import { Request, Response, NextFunction } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import httpStatus from "http-status-codes";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.headers, req.cookies);
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(403, "Missing Access Token");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      if (!verifiedToken) {
        throw new AppError(403, "You are not authorized");
      }

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if(!isUserExist.isVerified){
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified.")
      }
      
      if (!roles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to this route!!!");
      }


      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };