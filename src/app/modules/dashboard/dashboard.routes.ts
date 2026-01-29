import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";
import { getDashboard, getEarningsData, getPendingTasks, getRecentTaskSubmissions, getStats, getTopPerformingCourses } from "./instructor.controller";

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

router.get(
  "/admin-stats",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DashboardController.getAdminStats
);

router.get("/dashboard", checkAuth(Role.INSTRUCTOR), getDashboard);


router.get("/dashboard/stats",  checkAuth(Role.INSTRUCTOR), getStats);


router.get("/dashboard/top-courses", checkAuth(Role.INSTRUCTOR), getTopPerformingCourses);


router.get("/dashboard/recent-submissions", checkAuth(Role.INSTRUCTOR), getRecentTaskSubmissions);

router.get("/dashboard/unevaluated-tasks", checkAuth(Role.INSTRUCTOR), getPendingTasks);


router.get("/dashboard/monthly-earnings", checkAuth(Role.INSTRUCTOR), getEarningsData);


export const DashboardRoutes = router;