/* eslint-disable @typescript-eslint/no-unused-vars */
import fs from "fs";
import cloudinary from "../../config/cloudinary";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

interface UploadPayload {
  filePath?: string;       // multer temp path
  fileBase64?: string;     // data URL or pure base64
  fileMimetype?: string;   // MIME type from req.file.mimetype
  folder?: string;         // optional folder name
  filename?: string;       // optional original name
}

const uploadMedia = async (payload: UploadPayload) => {
  const { filePath, fileBase64, fileMimetype, folder = "asia-lms", filename } = payload;

  if (!filePath && !fileBase64) {
    throw new AppError(httpStatus.BAD_REQUEST, "File is required");
  }

  // Detect if it's a PDF
  const isPdf =
    fileMimetype === "application/pdf" ||
    fileBase64?.includes("application/pdf") ||
    filePath?.toLowerCase().endsWith(".pdf");

  try {
    const result = await cloudinary.uploader.upload(filePath || fileBase64!, {
      folder,
      resource_type: isPdf ? "raw" : "auto",  // pdf as raw, others auto
      type: "upload",                         // ensure public access
      use_filename: !!filename,
      filename_override: filename,
      pages: isPdf ? true : undefined,        // extract first page thumbnail
    });

    // Clean up temp file if exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Optional thumbnail for PDFs (first page)
    const thumbnailUrl =
      isPdf
        ? result.secure_url.replace("/raw/upload/", "/image/upload/pg_1,w_600/")
        : null;

    return {
      public_id: result.public_id,
      url: result.secure_url,
      thumbnailUrl,
      bytes: result.bytes,
      resource_type: result.resource_type,
      format: result.format,
    };
  } catch (err: any) {
    // Clean temp file on error too
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Cloudinary upload failed: ${err.message || err}`
    );
  }
};

export const UploadServices = { uploadMedia };
