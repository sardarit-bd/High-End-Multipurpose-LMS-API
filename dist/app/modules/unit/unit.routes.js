"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = require("../../middlewares/validateRequest");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface"); // adjust if Role is elsewhere
const unit_controller_1 = require("./unit.controller");
const unit_validation_1 = require("./unit.validation");
const router = (0, express_1.Router)();
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(unit_validation_1.createUnitZod), unit_controller_1.unitController.createUnit);
router.get("/:courseId", unit_controller_1.unitController.listUnits);
router.put("/:unitId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(unit_validation_1.updateUnitZod), unit_controller_1.unitController.updateUnit);
exports.UnitRoutes = router;
