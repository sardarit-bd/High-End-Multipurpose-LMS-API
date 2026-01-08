"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const task_controller_1 = require("./task.controller");
const router = (0, express_1.Router)();
/** POST /tasks/create (INSTRUCTOR | ADMIN) */
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), task_controller_1.taskController.createTask);
/** PUT /tasks/:id (INSTRUCTOR | ADMIN) */
router.put("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), task_controller_1.taskController.updateTask);
/** DELETE /tasks/:id (INSTRUCTOR | ADMIN) */
router.delete("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), task_controller_1.taskController.deleteTask);
/** GET /tasks/:unitId (public) - must be last to avoid conflicts */
router.get("/:unitId", task_controller_1.taskController.listTasks);
exports.TaskRoutes = router;
