"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const event_controller_1 = require("./event.controller");
const router = (0, express_1.Router)();
// Public
router.get("/", event_controller_1.eventController.listPublic);
router.get("/:eventId", event_controller_1.eventController.get);
// Admin / Partner
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), event_controller_1.eventController.create);
router.post("/checkout", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), event_controller_1.eventController.createCheckout);
router.patch("/:eventId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), event_controller_1.eventController.update);
router.delete("/:eventId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), event_controller_1.eventController.remove);
// Student participation
router.post("/:eventId/register", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN), event_controller_1.eventController.register);
router.post("/:eventId/attend", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN), event_controller_1.eventController.markAttendance);
exports.EventRoutes = router;
