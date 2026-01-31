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

router.patch("/courses/enrollments/status",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.updateStatus);

router.patch("/courses/:courseId/enrollments/:enrollmentId/progress",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.updateProgress);

router.post("/courses/:courseId/enrollments/:enrollmentId/complete-lesson",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.completeLesson);

router.patch("/courses/:courseId/enrollments/:enrollmentId/time-spent",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
    enrollmentController.updateTimeSpent);

router.get("/courses/:courseId/points/me",
    checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
    enrollmentController.getUserCoursePoints);

router.get("/courses/students",
    checkAuth(Role.INSTRUCTOR),
    enrollmentController.getEnrolledStudentsByInstructor);

export const EnrollmentRoutes = router;
