import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { quizController } from "./quiz.controller";

const router = Router();

/** Create quiz under a unit (also creates Task(type="quiz")) */
router.post(
  "/create",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),        // auth required
  quizController.createQuiz
);


router.post(
  "/add-question",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  quizController.addQuestion
);

router.get(
  "/:quizId/questions",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  quizController.getQuizQuestions
);

/** List quizzes for a unit (public) */
router.get(
  "/:unitId",
  quizController.listQuizzes
);

/** Student submits a quiz → auto-scored → points recorded via TaskSubmission */
router.post(
  "/submit",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),

  quizController.submitQuiz
);

export const QuizRoutes = router;
