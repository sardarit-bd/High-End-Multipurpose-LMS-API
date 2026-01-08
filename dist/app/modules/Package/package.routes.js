"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const package_controller_1 = require("./package.controller");
const router = (0, express_1.Router)();
// Public
router.get("/", package_controller_1.packageController.listPublic);
router.get("/:packageId", package_controller_1.packageController.get);
// Admin
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), package_controller_1.packageController.packageCreate);
router.patch("/:packageId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), package_controller_1.packageController.packageUpdate);
router.delete("/:packageId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), package_controller_1.packageController.remove);
// Student checkout
router.post("/checkout", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), package_controller_1.packageController.createCheckout);
exports.PackageRoutes = router;
