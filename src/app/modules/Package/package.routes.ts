import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { packageController } from "./package.controller";
import { createPackageZod, updatePackageZod, pkgIdParamsZod } from "./package.validation";

const router = Router();

// Public
router.get("/", packageController.listPublic);
router.get("/:packageId", packageController.get);

// Admin
router.post("/create", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), packageController.packageCreate);
router.patch("/:packageId", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), packageController.packageUpdate);
router.delete("/:packageId", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), packageController.remove);

// Student checkout
router.post("/checkout", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN), packageController.createCheckout);

export const PackageRoutes = router;
