import mongoose from "mongoose";
import { IGenericErrorResponse } from "../interfaces/error.types";


export const handleCastError = (err: mongoose.Error.CastError): IGenericErrorResponse => {
  console.log(err);
  return {
    statusCode: 400,
    message: "Invalid MongoDB Object Id",
  };
};