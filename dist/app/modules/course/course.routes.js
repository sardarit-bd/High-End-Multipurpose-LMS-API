"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface"); // adjust path if your Role lives elsewhere
const course_controller_1 = require("./course.controller");
const course_validation_1 = require("./course.validation");
const router = (0, express_1.Router)();
/** POST /courses — INSTRUCTOR | ADMIN */
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(course_validation_1.createCourseZodSchema), course_controller_1.courseController.createCourse);
/** GET /courses — public */
router.get("/", course_controller_1.courseController.listCourses);
/** GET /courses/:id — public */
router.get("/:id", course_controller_1.courseController.getCourse);
/** PATCH /courses/:id — INSTRUCTOR | ADMIN + ownership check in service */
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(course_validation_1.updateCourseZodSchema), course_controller_1.courseController.updateCourse);
/** DELETE /courses/:id — ADMIN only */
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), course_controller_1.courseController.deleteCourse);
exports.CourseRoutes = router;
