import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { badgeController } from "./badge.controller";


const router = Router();

// Admin routes
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  badgeController.create
);

router.patch(
  "/:badgeId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  badgeController.update
);

router.delete(
  "/badges/:badgeId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  badgeController.remove
);

// Public / user
router.get("/", badgeController.listAll);
router.get("/me", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN), badgeController.myBadges);

// Admin manual issue
router.post(
  "/issue",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  badgeController.issue
);

export const BadgeRoutes = router;
