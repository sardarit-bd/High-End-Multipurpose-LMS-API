import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface"; // adjust path if your Role lives elsewhere
import { courseController } from "./course.controller";
import {
  createCourseZodSchema,
  updateCourseZodSchema,
  listCourseQueryZodSchema,
} from "./course.validation";
import { checkEnrollment } from "../../middlewares/checkEnrollment";

const router = Router();

/** POST /courses — INSTRUCTOR | ADMIN */
router.post(
  "/create",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createCourseZodSchema),
  courseController.createCourse
);

/** GET /courses — public */
router.get(
  "/",
  courseController.listCourses
);

/** GET /courses/:id — public */
router.get("/:id", courseController.getCourse);

/** PATCH /courses/:id — INSTRUCTOR | ADMIN + ownership check in service */
router.patch(
  "/:id",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateCourseZodSchema),
  courseController.updateCourse
);

/** DELETE /courses/:id — ADMIN only */
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  courseController.deleteCourse
);

export const CourseRoutes = router;
