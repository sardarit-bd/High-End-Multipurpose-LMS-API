import { Router } from "express";
import multer from "multer";
import path from "path";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { UploadController } from "./upload.controller";

const router = Router();

// ✅ Use memory storage for Vercel (serverless-compatible)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    // Optional: Validate file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mov|avi|doc|docx|ppt|pptx|txt|csv/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

router.post(
  "/",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  upload.single("file"),
  UploadController.uploadFile
);

export const UploadRoutes = router;