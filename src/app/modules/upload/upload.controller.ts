import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { UploadServices } from "./upload.service";

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const fileBuffer = req.file?.buffer;
  const fileMimetype = req.file?.mimetype;
  const originalname = req.file?.originalname;
  const fileBase64 = req.body?.fileBase64;
  const folder = req.body?.folder || "asia-lms";

  // Check if file exists (either from multer or base64)
  if (!fileBuffer && !fileBase64) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No file provided",
      data: null,
    });
  }

  // Convert buffer to base64 if file was uploaded via multer
  let base64Data: string | undefined;
  if (fileBuffer) {
    base64Data = `data:${fileMimetype};base64,${fileBuffer.toString("base64")}`;
  }

  // Call service with buffer data
  const data = await UploadServices.uploadMedia({
    fileBase64: base64Data || fileBase64,
    fileMimetype,
    folder,
    filename: originalname,
  });

  // Optional: Track uploaded file for potential rollback
  res.locals.uploaded = {
    public_id: data.public_id,
    resource_type: data.resource_type,
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully",
    data,
  });
});

export const UploadController = { uploadFile };