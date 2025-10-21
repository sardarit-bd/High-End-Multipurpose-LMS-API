import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { taskController } from "./task.controller";
import { createTaskSchema } from "./task.validation";


const router = Router();

/** POST /units/:unitId/tasks (INSTRUCTOR | ADMIN) */
router.post(
  "/:unitId/create",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),        // auth required
//   validateRequest(createTaskSchema),
  taskController.createTask
);

/** GET /units/:unitId/tasks (public) */
router.get(
  "/:unitId",
  taskController.listTasks
);

export const TaskRoutes = router;
