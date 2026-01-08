"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadServices = void 0;
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const uploadMedia = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileBase64, fileMimetype, folder = "asia-lms", filename } = payload;
    if (!fileBase64) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "File data is required");
    }
    // Detect if it's a PDF
    const isPdf = fileMimetype === "application/pdf" ||
        fileBase64.includes("application/pdf") ||
        (filename === null || filename === void 0 ? void 0 : filename.toLowerCase().endsWith(".pdf"));
    // Detect if it's a video
    const isVideo = (fileMimetype === null || fileMimetype === void 0 ? void 0 : fileMimetype.startsWith("video/")) ||
        /\.(mp4|mov|avi|webm|mkv)$/i.test(filename || "");
    // Determine resource type
    let resourceType = "auto";
    if (isPdf) {
        resourceType = "raw";
    }
    else if (isVideo) {
        resourceType = "video";
    }
    try {
        const result = yield cloudinary_1.default.uploader.upload(fileBase64, {
            folder,
            resource_type: resourceType,
            type: "upload",
            use_filename: !!filename,
            filename_override: filename,
            pages: isPdf ? true : undefined, // Extract first page thumbnail for PDFs
        });
        // Optional thumbnail for PDFs (first page as image)
        const thumbnailUrl = isPdf
            ? result.secure_url.replace("/raw/upload/", "/image/upload/pg_1,w_600,f_jpg/")
            : null;
        return {
            public_id: result.public_id,
            url: result.secure_url,
            thumbnailUrl,
            bytes: result.bytes,
            resource_type: result.resource_type,
            format: result.format,
        };
    }
    catch (err) {
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, `Cloudinary upload failed: ${err.message || err}`);
    }
});
exports.UploadServices = { uploadMedia };
