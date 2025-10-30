import { Router } from "express";
import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";



const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser
);
router.get("/me", checkAuth(...Object.values(Role)), userController.getMe);
router.get("/instructor/:id", userController.getInstructor)

router.post(
  "/request-instructor",
  checkAuth(Role.STUDENT), // allow student; instructors/admins will be rejected by service if already
  userController.requestInstructor
);

/** Admin: approve/reject request (and promote to instructor) */
router.patch(
  "/make-instructor",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.approveInstructor
);
export const UserRoutes = router;