import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { gamificationController } from "./gamification.controller";

const router = Router();

router.get("/me", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN), gamificationController.getMyPoints);
router.get("/leaderboard", gamificationController.getLeaderboard); // public/global

// optional manual award
router.post(
  "/award",
  checkAuth(Role.ADMIN, Role.INSTRUCTOR),
  gamificationController.award
);

export const GamificationRoutes = router;
