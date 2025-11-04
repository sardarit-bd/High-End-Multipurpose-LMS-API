import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { orderController } from "./order.controller";


const router = Router();

router.patch(
  "/:id/fulfill",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.fulfillEcommerce
);

router.patch(
  "/:id/track",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.updateTracking
);

router.patch(
  "/:id/deliver",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.markDelivered
);

router.patch(
  "/:id/cancel",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  orderController.cancelOrder
);
router.post(
  "/checkout/ecommerce",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.checkoutEcommerce
);

router.post(
  "/checkout",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),

  orderController.createCheckout
);

router.get("/me", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN), orderController.getMyOrders);

router.get(
  "/",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrders
);
router.get(
  "/:orderId",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrderById
);

router.get(
  "/session/:sessionId",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrderBySession
);

export const OrderRoutes = router;
