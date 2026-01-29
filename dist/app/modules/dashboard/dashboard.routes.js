"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const dashboard_controller_1 = require("./dashboard.controller");
const instructor_controller_1 = require("./instructor.controller");
const router = (0, express_1.Router)();
/** GET /dashboard/instructor — INSTRUCTOR only */
router.get("/instructor", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getInstructorDashboard);
/** GET /dashboard/stats — INSTRUCTOR only */
router.get("/stats", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getInstructorStats);
/** GET /dashboard/earnings-chart — INSTRUCTOR only */
router.get("/earnings-chart", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getEarningsChart);
/** GET /dashboard/course-stats/:instructorId — INSTRUCTOR only */
router.get("/course-stats/:instructorId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getCourseStats);
/** GET /dashboard/student — STUDENT only */
router.get("/student", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), dashboard_controller_1.DashboardController.getStudentDashboard);
router.get("/admin-stats", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), dashboard_controller_1.DashboardController.getAdminStats);
router.get("/dashboard", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), instructor_controller_1.getDashboard);
router.get("/dashboard/stats", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), instructor_controller_1.getStats);
router.get("/dashboard/top-courses", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), instructor_controller_1.getTopPerformingCourses);
router.get("/dashboard/recent-submissions", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), instructor_controller_1.getRecentTaskSubmissions);
router.get("/dashboard/unevaluated-tasks", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), instructor_controller_1.getPendingTasks);
router.get("/dashboard/monthly-earnings", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), instructor_controller_1.getEarningsData);
exports.DashboardRoutes = router;
