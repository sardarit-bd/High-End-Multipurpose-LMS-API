"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRoutes = void 0;
// routes/category.routes.ts
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const category_controller_1 = require("./category.controller");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
router.route("/")
    .get(category_controller_1.categoriesController.getAllCategories)
    .post((0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), category_controller_1.categoriesController.createCategory);
router.route("/:id")
    .get(category_controller_1.categoriesController.getCategory)
    .patch((0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), category_controller_1.categoriesController.updateCategory)
    .delete((0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), category_controller_1.categoriesController.deleteCategory);
exports.categoriesRoutes = router;
