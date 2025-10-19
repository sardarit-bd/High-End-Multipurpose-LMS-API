import { Router } from "express";
import { UserServices } from "./user.services";
import { createUserZodSchema } from "./user.validation";
import { userController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";



const router = Router();
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userController.createUser
);

router.get("/me", UserServices.getMe);


export const UserRoutes = router;