import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { eventController } from "./event.controller";

const router = Router();

// Public
router.get("/", eventController.listPublic);

router.get("/my-registrations", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN), eventController.listMyRegisteredEvents);
router.get("/all-registrations", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.STUDENT, Role.INSTRUCTOR), eventController.getAllRegistrations);

router.get("/:eventId", eventController.get);

// Admin / Partner
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  eventController.create
);
router.post(
  "/checkout",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  eventController.createCheckout
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
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  eventController.register
);

router.post(
  "/:eventId/attend",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN),
  eventController.markAttendance
);

export const EventRoutes = router;
