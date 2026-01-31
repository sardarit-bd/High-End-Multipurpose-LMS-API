// app/modules/school/school.routes.ts
import express from "express";
import { SchoolController } from "./school.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SchoolController.create
);

router.get("/", SchoolController.listAll);

router.get("/:schoolId", SchoolController.getById);

router.patch(
  "/:schoolId",
 checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SchoolController.update
);

router.patch(
  "/:schoolId/toggle-status",
 checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  SchoolController.toggleStatus
);

router.delete("/:schoolId",checkAuth(Role.SUPER_ADMIN, Role.ADMIN), SchoolController.remove);

export const schoolRoutes =  router;