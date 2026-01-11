/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CertificateServices } from "./certificate.services";

const downloadCertificate = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { courseId } = req.params;

  const pdfBuffer = await CertificateServices.generateCertificate(courseId, token.userId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="certificate.pdf"');

  res.send(pdfBuffer);
});

export const certificateController = {
  downloadCertificate,
};