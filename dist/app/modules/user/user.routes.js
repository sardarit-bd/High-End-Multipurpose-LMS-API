"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_validation_1 = require("./user.validation");
const user_controller_1 = require("./user.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("./user.interface");
const checkAuth_1 = require("../../middlewares/checkAuth");
const sendEmail_1 = require("../../utils/sendEmail");
const router = (0, express_1.Router)();
router.post("/register", (0, validateRequest_1.validateRequest)(user_validation_1.createUserZodSchema), user_controller_1.userController.createUser);
router.get("/me", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.userController.getMe);
router.patch("/me", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), user_controller_1.userController.updateMe);
router.get("/students/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.STUDENT), user_controller_1.userController.getStudentProfile);
router.get("/instructor/:id", user_controller_1.userController.getInstructor);
router.get("/instructor", user_controller_1.userController.getAllInstructors);
router.get("/students", user_controller_1.userController.getAllStudents);
router.get("/expertise", user_controller_1.userController.getUniqueExpertise);
router.post("/request-instructor", (0, checkAuth_1.checkAuth)(user_interface_1.Role.STUDENT), // allow student; instructors/admins will be rejected by service if already
user_controller_1.userController.requestInstructor);
/** Admin: approve/reject request (and promote to instructor) */
router.patch("/make-instructor", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.userController.approveInstructor);
router.patch("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.INSTRUCTOR, user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.STUDENT), user_controller_1.userController.updateInstructor);
router.get('/all-admin', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.userController.getAllAdmins);
// Create new admin - SUPER_ADMIN only
router.post('/create-admin', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.userController.createAdmin);
// Delete admin - SUPER_ADMIN only
router.delete('/delete-admin/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), user_controller_1.userController.deleteAdmin);
router.post("/send-mail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phone, email, subject, message } = req.body;
    yield (0, sendEmail_1.sendEmail)(name, phone, email, subject, message);
    res.status(200).json({
        message: `Message sent successfully: ${message}`,
        name,
        phone,
        email,
        subject,
    });
}));
exports.UserRoutes = router;
