"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const submission_controller_1 = require("./submission.controller");
const router = (0, express_1.Router)();
/** STUDENT creates submission for video/pdf */
router.post("/:taskId/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), 
//   validateRequest(createReviewedSubmissionZod),
submission_controller_1.submissionController.createReviewedSubmission);
/** INSTRUCTOR/ADMIN grades a submission */
router.patch("/task/grade", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), 
//   validateRequest(gradeSubmissionZod),
submission_controller_1.submissionController.gradeSubmission);
/** My total for a course */
router.get("/:courseId/points/me", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT, user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), submission_controller_1.submissionController.getMyCourseTotal);
exports.SubmissionRoutes = router;
