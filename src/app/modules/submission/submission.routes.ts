import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { submissionController } from "./submission.controller";


const router = Router();

/** STUDENT creates submission for video/pdf */
router.get(
  "/me",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.getMyAllSubmissions
);
router.post(
  "/:taskId/create",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
//   validateRequest(createReviewedSubmissionZod),
  submissionController.createReviewedSubmission
);

/** INSTRUCTOR/ADMIN grades a submission */
router.patch(
  "/task/grade",
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

/** My submissions by unit */
router.get(
  "/units/:unitId/me",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.getMySubmissionsByUnit
);

/** Check if task is submitted by me */
router.get(
  "/tasks/:taskId/me",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.getMyTaskSubmission
);

/** INSTRUCTOR gets submissions for review */
router.get(
  "/tasks/:taskId/review",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.getSubmissionsForReview
);

/** INSTRUCTOR reviews a submission */
router.patch(
  "/:submissionId/review",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.reviewSubmission
);

/** Get all submissions for a unit (for instructors) */
router.get(
  "/units/:unitId/submissions",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  submissionController.getSubmissionsByUnit
);


export const SubmissionRoutes = router;
