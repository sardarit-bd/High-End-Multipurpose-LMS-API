import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { enrollmentController } from "./enrollment.controller";

const router = Router();

router.post("/:courseId/enroll",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.enrollSelf);

router.get("/:courseId/me",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
    enrollmentController.getMyEnrollment);
    
router.get("/me",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.listMyEnrollments);

router.get("/courses/:courseId/enrollments",
    checkAuth(Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.listCourseEnrollments);

router.patch("/courses/:courseId/enrollments/:enrollmentId/status",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.updateStatus);

router.patch("/courses/:courseId/enrollments/:enrollmentId/progress",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.updateProgress);

export const EnrollmentRoutes = router;
