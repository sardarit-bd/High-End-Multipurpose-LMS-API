/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";

import { IErrorSources } from "../interfaces/error.types";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleZodError } from "../helpers/handleZoodError";
import { handleValidationError } from "../helpers/handleValidationError";
import AppError from "../errorHelpers/AppError";
import cloudinary from "../config/cloudinary";



export const deleteImageFromCloudinary = async (
  public_id?: string,
  resource_type?: "image" | "video" | "raw"
) => {
  if (!public_id) return;
  try {
    // default to image; better: store resource_type when you upload and pass it here
    const type = resource_type || "image";
    await cloudinary.uploader.destroy(public_id, { resource_type: type });
  } catch (e) {
    // swallow cleanup errors
  }
};

export const globalErrorHandle = async(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if(envVars.NODE_ENV === 'development'){
    console.log(err)
  }
  
  let statusCode = 500;
  let message = `Something wen wrong!! ${err.message}`;
  let errorsSource: IErrorSources[] = [];

  if(req.file){
    await deleteImageFromCloudinary(req.file.path)
  }

  if(req.files && req.files.length){
    const images = (req.files as Express.Multer.File[]).map(file => file.path)
    await Promise.all(images.map(url => deleteImageFromCloudinary(url)))
  }

  // duplicate error
  if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

    // Object Id / mongoose id
  } else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

    // Zod Validation Error
  } else if (err.name === "ZodError") {
    const simplifiedError = handleZodError(err)

    message = simplifiedError.message;
    statusCode = simplifiedError.statusCode;
    errorsSource = simplifiedError.errorSources as IErrorSources[]

    // mongoose validation error
  } else if (err.name == "ValidationError") {
    const simplifiedError = handleValidationError(err)
    message = simplifiedError.message
    statusCode = simplifiedError.statusCode
    errorsSource = simplifiedError.errorSources as IErrorSources[]


  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorsSource,
    err: envVars.NODE_ENV === 'development' ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
