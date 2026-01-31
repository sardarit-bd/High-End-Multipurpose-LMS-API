"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolRoutes = void 0;
// app/modules/school/school.routes.ts
const express_1 = __importDefault(require("express"));
const school_controller_1 = require("./school.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), school_controller_1.SchoolController.create);
router.get("/", school_controller_1.SchoolController.listAll);
router.get("/:schoolId", school_controller_1.SchoolController.getById);
router.patch("/:schoolId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), school_controller_1.SchoolController.update);
router.patch("/:schoolId/toggle-status", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), school_controller_1.SchoolController.toggleStatus);
router.delete("/:schoolId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.ADMIN), school_controller_1.SchoolController.remove);
exports.schoolRoutes = router;
