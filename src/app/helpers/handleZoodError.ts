/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGenericErrorResponse, IErrorSources } from "../interfaces/error.types";

export const handleZodError = (err: any): IGenericErrorResponse => {
  const errorSources: IErrorSources[] = []
   err.issues.forEach((issue: any) => {
      errorSources.push({
        path: issue.path[issue.path.length - 1],
        message: issue.message,
      });
    });

    return{
      message: 'Zod Error',
      statusCode: 400,
      errorSources
    }
}