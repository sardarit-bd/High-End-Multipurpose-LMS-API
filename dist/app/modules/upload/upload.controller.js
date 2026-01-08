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
exports.UploadController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const upload_service_1 = require("./upload.service");
const uploadFile = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const fileBuffer = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer;
    const fileMimetype = (_b = req.file) === null || _b === void 0 ? void 0 : _b.mimetype;
    const originalname = (_c = req.file) === null || _c === void 0 ? void 0 : _c.originalname;
    const fileBase64 = (_d = req.body) === null || _d === void 0 ? void 0 : _d.fileBase64;
    const folder = ((_e = req.body) === null || _e === void 0 ? void 0 : _e.folder) || "asia-lms";
    // Check if file exists (either from multer or base64)
    if (!fileBuffer && !fileBase64) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.BAD_REQUEST,
            success: false,
            message: "No file provided",
            data: null,
        });
    }
    // Convert buffer to base64 if file was uploaded via multer
    let base64Data;
    if (fileBuffer) {
        base64Data = `data:${fileMimetype};base64,${fileBuffer.toString("base64")}`;
    }
    // Call service with buffer data
    const data = yield upload_service_1.UploadServices.uploadMedia({
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
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "File uploaded successfully",
        data,
    });
}));
exports.UploadController = { uploadFile };
