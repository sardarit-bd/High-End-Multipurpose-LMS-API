import { Router } from "express";
import { CategoryController } from "./category.controller";
import { checkAuth } from "../../../middlewares/checkAuth";
import { Role } from "../../user/user.interface";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CategoryController.createCategory
);

router.get("/", CategoryController.listCategories);
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CategoryController.updateCategory);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), CategoryController.removeCategory);

export const CategoryRoutes = router;
