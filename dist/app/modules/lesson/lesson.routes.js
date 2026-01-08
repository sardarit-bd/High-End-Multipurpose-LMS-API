"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface"); // adjust path if Role lives elsewhere
const lesson_controller_1 = require("./lesson.controller");
const lesson_validation_1 = require("./lesson.validation");
const router = (0, express_1.Router)();
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), // auth required    // validate :unitId
(0, validateRequest_1.validateRequest)(lesson_validation_1.createLessonZod), // validate body
lesson_controller_1.lessonController.createLesson);
/** GET /units/:unitId/lessons  (public) */
router.get("/:unitId", lesson_controller_1.lessonController.listLessons);
router.post("/complete", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN), lesson_controller_1.lessonController.completeLesson);
router.put("/:lessonId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(lesson_validation_1.updateLessonZod), lesson_controller_1.lessonController.updateLesson);
exports.LessonRoutes = router;
