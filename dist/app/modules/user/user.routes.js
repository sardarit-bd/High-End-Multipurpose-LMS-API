"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_validation_1 = require("./user.validation");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("./user.interface");
const checkAuth_1 = require("../../middlewares/checkAuth");
const router = (0, express_1.Router)();
router.post("/register", (0, validateRequest_1.validateRequest)(user_validation_1.createUserZodSchema), user_controller_1.userController.createUser);
router.get("/me", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.userController.getMe);
router.get("/instructor/:id", user_controller_1.userController.getInstructor);
router.post("/request-instructor", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), // allow student; instructors/admins will be rejected by service if already
user_controller_1.userController.requestInstructor);
/** Admin: approve/reject request (and promote to instructor) */
router.patch("/make-instructor", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.userController.approveInstructor);
exports.UserRoutes = router;
