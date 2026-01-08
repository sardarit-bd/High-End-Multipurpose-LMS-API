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
exports.globalErrorHandle = exports.deleteImageFromCloudinary = void 0;
const env_1 = require("../config/env");
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleZoodError_1 = require("../helpers/handleZoodError");
const handleValidationError_1 = require("../helpers/handleValidationError");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const deleteImageFromCloudinary = (public_id, resource_type) => __awaiter(void 0, void 0, void 0, function* () {
    if (!public_id)
        return;
    try {
        // default to image; better: store resource_type when you upload and pass it here
        const type = resource_type || "image";
        yield cloudinary_1.default.uploader.destroy(public_id, { resource_type: type });
    }
    catch (e) {
        // swallow cleanup errors
    }
});
exports.deleteImageFromCloudinary = deleteImageFromCloudinary;
const globalErrorHandle = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => __awaiter(void 0, void 0, void 0, function* () {
    if (env_1.envVars.NODE_ENV === 'development') {
        // console.log(err)
    }
    let statusCode = 500;
    let message = `Something wen wrong!! ${err.message}`;
    let errorsSource = [];
    if (req.file) {
        yield (0, exports.deleteImageFromCloudinary)(req.file.path);
    }
    if (req.files && req.files.length) {
        const images = req.files.map(file => file.path);
        yield Promise.all(images.map(url => (0, exports.deleteImageFromCloudinary)(url)));
    }
    // duplicate error
    if (err.code === 11000) {
        const simplifiedError = (0, handleDuplicateError_1.handleDuplicateError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        // Object Id / mongoose id
    }
    else if (err.name === "CastError") {
        const simplifiedError = (0, handleCastError_1.handleCastError)(err);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        // Zod Validation Error
    }
    else if (err.name === "ZodError") {
        const simplifiedError = (0, handleZoodError_1.handleZodError)(err);
        message = simplifiedError.message;
        statusCode = simplifiedError.statusCode;
        errorsSource = simplifiedError.errorSources;
        // mongoose validation error
    }
    else if (err.name == "ValidationError") {
        const simplifiedError = (0, handleValidationError_1.handleValidationError)(err);
        message = simplifiedError.message;
        statusCode = simplifiedError.statusCode;
        errorsSource = simplifiedError.errorSources;
    }
    else if (err instanceof AppError_1.default) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        statusCode = 500;
        message = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorsSource,
        err: env_1.envVars.NODE_ENV === 'development' ? err : null,
        stack: env_1.envVars.NODE_ENV === "development" ? err.stack : null,
    });
});
exports.globalErrorHandle = globalErrorHandle;
