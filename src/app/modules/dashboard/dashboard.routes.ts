import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";

const router = Router();

/** GET /dashboard/instructor — INSTRUCTOR only */
router.get(
  "/instructor",
  checkAuth(Role.INSTRUCTOR),
  DashboardController.getInstructorDashboard
);

/** GET /dashboard/stats — INSTRUCTOR only */
router.get(
  "/stats",
  checkAuth(Role.INSTRUCTOR),
  DashboardController.getInstructorStats
);

/** GET /dashboard/earnings-chart — INSTRUCTOR only */
router.get(
  "/earnings-chart",
  checkAuth(Role.INSTRUCTOR),
  DashboardController.getEarningsChart
);

/** GET /dashboard/course-stats/:instructorId — INSTRUCTOR only */
router.get(
  "/course-stats/:instructorId",
  checkAuth(Role.INSTRUCTOR),
  DashboardController.getCourseStats
);

/** GET /dashboard/student — STUDENT only */
router.get(
  "/student",
  checkAuth(Role.STUDENT),
  DashboardController.getStudentDashboard
);

export const DashboardRoutes = router;