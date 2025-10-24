import { Router } from "express";
import multer from "multer";
import path from "path";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { UploadController } from "./upload.controller";

const router = Router();

/**
 * ✅ Configure Multer
 * - Destination: temp/ (auto-created if missing)
 * - Keep original extension (helps PDF detection)
 */
const storage = multer.diskStorage({
  destination: "temp/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

/**
 * ✅ Upload API
 * POST /api/v1/uploads
 */
router.post(
  "/",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  upload.single("file"),
  UploadController.uploadFile
);

export const UploadRoutes = router;
