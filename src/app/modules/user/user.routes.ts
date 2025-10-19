import { Router } from "express";
import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";



const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser
);
router.get("/me", checkAuth(...Object.values(Role)), userController.getMe);


export const UserRoutes = router;