"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityRoutes = void 0;
// app/modules/city/city.routes.ts
const express_1 = __importDefault(require("express"));
const city_controller_1 = require("./city.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), city_controller_1.CityController.create);
router.get("/", city_controller_1.CityController.listAll);
router.get("/:cityId", city_controller_1.CityController.getById);
router.patch("/:cityId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), city_controller_1.CityController.update);
router.patch("/:cityId/toggle-status", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), city_controller_1.CityController.toggleStatus);
router.delete("/:cityId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.ADMIN), city_controller_1.CityController.remove);
exports.cityRoutes = router;
