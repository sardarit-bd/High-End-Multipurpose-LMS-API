import { Router } from "express";
import { ProductController } from "./product.controller";
import { checkAuth } from "../../../middlewares/checkAuth";
import { Role } from "../../user/user.interface";

const router = Router();

router.post("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.createProduct);
router.get("/", ProductController.listProducts);
router.get('/purchased-product', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT), ProductController.getPurchasedProducts)
router.get("/:slug", ProductController.getProduct);
router.put("/:slug", ProductController.updateProduct);

export const ProductRoutes = router;
