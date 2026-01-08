import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { taskController } from "./task.controller";
import { createTaskSchema } from "./task.validation";


const router = Router();

/** POST /tasks/create (INSTRUCTOR | ADMIN) */
router.post(
  "/create",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  taskController.createTask
);

/** PUT /tasks/:id (INSTRUCTOR | ADMIN) */
router.put(
  "/:id",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  taskController.updateTask
);

/** DELETE /tasks/:id (INSTRUCTOR | ADMIN) */
router.delete(
  "/:id",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  taskController.deleteTask
);

/** GET /tasks/:unitId (public) - must be last to avoid conflicts */
router.get(
  "/:unitId",
  taskController.listTasks
);

export const TaskRoutes = router;
