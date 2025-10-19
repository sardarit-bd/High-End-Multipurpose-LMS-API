import { Router } from "express";
import { UserServices } from "./user.services";



const router = Router();

router.get("/me", UserServices.getMe);


export const UserRoutes = router;