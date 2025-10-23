import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { orderController } from "./order.controller";


const router = Router();

router.post(
  "/checkout",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),

  orderController.createCheckout
);

router.get("/me", checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN), orderController.getMyOrders);

router.get(
  "/:orderId",
  checkAuth(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN),
  orderController.getOrder
);

export const OrderRoutes = router;
