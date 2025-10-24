import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface"; // adjust path if Role lives elsewhere
import { lessonController } from "./lesson.controller";
import { createLessonZod } from "./lesson.validation";

const router = Router();


router.post(
  "/create",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),        // auth required    // validate :unitId
  validateRequest(createLessonZod),              // validate body
  lessonController.createLesson
);

/** GET /units/:unitId/lessons  (public) */
router.get(
  "/:unitId",
  lessonController.listLessons
);

router.post(
  "/complete",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
  lessonController.completeLesson
);

export const LessonRoutes = router;
