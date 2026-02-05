import { Request, Response, Router } from "express";
import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";
import { sendEmail } from "../../utils/sendEmail";



const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser
);
router.get("/me", checkAuth(...Object.values(Role)), userController.getMe);
router.patch("/me", checkAuth(...Object.values(Role)), userController.updateMe);
router.get("/students/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.STUDENT), userController.getStudentProfile);
router.get("/instructor/:id", userController.getInstructor)
router.get("/instructor", userController.getAllInstructors)
router.get("/students", userController.getAllStudents)
router.get("/expertise", userController.getUniqueExpertise)


router.post(
  "/request-instructor",
  checkAuth(Role.STUDENT), // allow student; instructors/admins will be rejected by service if already
  userController.requestInstructor
);

/** Admin: approve/reject request (and promote to instructor) */
router.patch(
  "/make-instructor",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  userController.approveInstructor
);

router.patch(
  "/:id",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN, Role.STUDENT),
  userController.updateInstructor
);

router.get('/all-admin', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), userController.getAllAdmins);

// Create new admin - SUPER_ADMIN only
router.post('/create-admin', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), userController.createAdmin);

// Delete admin - SUPER_ADMIN only
router.delete('/delete-admin/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), userController.deleteAdmin);

router.post("/send-mail", async (req: Request, res: Response) => {
  const {name, phone, email, subject, message} = req.body
  await sendEmail(name, phone, email, subject, message);
  
  res.status(200).json({
    message: `Message sent successfully: ${message}`,
    name,
    phone,
    email,
    subject,  
  });
});
export const UserRoutes = router;