import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { UploadServices } from "./upload.service";

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const filePath = req.file?.path;
  const fileBase64 = req.body?.fileBase64;
  const folder = req.body?.folder || "asia-lms";

  if (!filePath && !fileBase64) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No file provided",
      data: null,
    });
  }

  // 🔹 Call service with MIME + original name for better detection
  const data = await UploadServices.uploadMedia({
    filePath,
    fileBase64,
    fileMimetype: req.file?.mimetype,
    folder,
    filename: req.file?.originalname,
  });

  // (Optional) If you want global middleware cleanup or rollback tracking
  res.locals.uploaded = { 
    public_id: data.public_id, 
    resource_type: data.resource_type 
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully",
    data,
  });
});

export const UploadController = { uploadFile };
