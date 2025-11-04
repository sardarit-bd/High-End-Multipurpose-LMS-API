import { Router } from "express";
import { ProductController } from "./product.controller";
import { checkAuth } from "../../../middlewares/checkAuth";
import { Role } from "../../user/user.interface";

const router = Router();

router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.createProduct);
router.get("/", ProductController.listProducts);
router.get("/:slug", ProductController.getProduct);

export const ProductRoutes = router;
