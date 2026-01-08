"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const dashboard_controller_1 = require("./dashboard.controller");
const router = (0, express_1.Router)();
/** GET /dashboard/instructor — INSTRUCTOR only */
router.get("/instructor", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getInstructorDashboard);
/** GET /dashboard/stats — INSTRUCTOR only */
router.get("/stats", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getInstructorStats);
/** GET /dashboard/earnings-chart — INSTRUCTOR only */
router.get("/earnings-chart", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getEarningsChart);
/** GET /dashboard/course-stats/:instructorId — INSTRUCTOR only */
router.get("/course-stats/:instructorId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR), dashboard_controller_1.DashboardController.getCourseStats);
exports.DashboardRoutes = router;
