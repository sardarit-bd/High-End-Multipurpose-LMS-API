"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const badge_controller_1 = require("./badge.controller");
const router = (0, express_1.Router)();
// Admin routes
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), badge_controller_1.badgeController.create);
router.patch("/:badgeId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), badge_controller_1.badgeController.update);
router.delete("/:badgeId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), badge_controller_1.badgeController.remove);
// Public / user
router.get("/", badge_controller_1.badgeController.listAll);
router.get("/me", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN), badge_controller_1.badgeController.myBadges);
// Admin manual issue
router.post("/issue", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), badge_controller_1.badgeController.issue);
exports.BadgeRoutes = router;
