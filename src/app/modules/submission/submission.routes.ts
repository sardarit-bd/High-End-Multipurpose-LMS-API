import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { submissionController } from "./submission.controller";


const router = Router();

/** STUDENT creates submission for video/pdf */
router.post(
  "/:taskId/create",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
//   validateRequest(createReviewedSubmissionZod),
  submissionController.createReviewedSubmission
);

/** INSTRUCTOR/ADMIN grades a submission */
router.patch(
  "/:submissionId/task/:taskId/grade",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
//   validateRequest(gradeSubmissionZod),
  submissionController.gradeSubmission
);

/** My total for a course */
router.get(
  "/:courseId/points/me",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.getMyCourseTotal
);


export const SubmissionRoutes = router;
