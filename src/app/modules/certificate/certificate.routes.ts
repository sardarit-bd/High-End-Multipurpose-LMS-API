import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { certificateController } from "./certificate.controller";

const router = Router();

router.get(
  "/:courseId/download",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  certificateController.downloadCertificate
);

export const CertificateRoutes = router;