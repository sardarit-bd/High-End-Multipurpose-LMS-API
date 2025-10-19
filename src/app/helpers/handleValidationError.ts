/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGenericErrorResponse, IErrorSources } from "../interfaces/error.types";

export const handleValidationError = (err: any) : IGenericErrorResponse => {
  const errors = Object.values(err.errors);
  const errorSources: IErrorSources[] = [];

  errors.forEach((errorObject: any) =>
    errorSources.push({
      path: errorObject.path,
      message: errorObject.message,
    })
  );

  return{
    statusCode: 400,
    message: "Validation Error",
    errorSources
  }
};