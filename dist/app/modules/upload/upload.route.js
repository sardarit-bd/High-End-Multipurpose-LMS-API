"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const upload_controller_1 = require("./upload.controller");
const router = (0, express_1.Router)();
// ✅ Use memory storage for Vercel (serverless-compatible)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        // Optional: Validate file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|doc|docx|ppt|pptx|txt|csv/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        else {
            cb(new Error("Invalid file type"));
        }
    },
});
router.post("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), upload.single("file"), upload_controller_1.UploadController.uploadFile);
exports.UploadRoutes = router;
