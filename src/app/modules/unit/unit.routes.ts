import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface"; // adjust if Role is elsewhere
import { unitController } from "./unit.controller";
import { createUnitZod } from "./unit.validation";

const router = Router();


router.post(
  "/create",
  checkAuth(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createUnitZod),
  unitController.createUnit
);


router.get(
  "/:courseId",
  unitController.listUnits
);

export const UnitRoutes = router;
