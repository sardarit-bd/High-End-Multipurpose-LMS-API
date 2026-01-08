"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const quiz_controller_1 = require("./quiz.controller");
const router = (0, express_1.Router)();
/** Create quiz under a unit (also creates Task(type="quiz")) */
router.post("/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), // auth required
quiz_controller_1.quizController.createQuiz);
router.post("/add-question", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), quiz_controller_1.quizController.addQuestion);
router.put("/update-question/:questionId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), quiz_controller_1.quizController.updateQuestion);
router.delete("/delete-question/:questionId", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), quiz_controller_1.quizController.deleteQuestion);
router.get("/:quizId/questions", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), quiz_controller_1.quizController.getQuizQuestions);
/** List quizzes for a unit (public) */
router.get("/:taskId", quiz_controller_1.quizController.listQuizzes);
/** Student submits a quiz → auto-scored → points recorded via TaskSubmission */
router.post("/submit", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), quiz_controller_1.quizController.submitQuiz);
router.post("/fix-existing-tasks", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), quiz_controller_1.quizController.fixExistingQuizTasks);
exports.QuizRoutes = router;
