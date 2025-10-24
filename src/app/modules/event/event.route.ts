import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { eventController } from "./event.controller";

const router = Router();

// Public
router.get("/", eventController.listPublic);
router.get("/:eventId", eventController.get);

// Admin / Partner
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  eventController.create
);
router.patch(
  "/:eventId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  eventController.update
);
router.delete(
  "/:eventId",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  eventController.remove
);

// Student participation
router.post(
  "/:eventId/register",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
  eventController.register
);

router.post(
  "/:eventId/attend",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
  eventController.markAttendance
);

export const EventRoutes = router;
