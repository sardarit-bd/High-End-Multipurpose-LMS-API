// routes/category.routes.ts
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { categoriesController } from "./category.controller";
import { Role } from "../user/user.interface";


const router = express.Router();

router.route("/")
  .get(categoriesController.getAllCategories)
  .post(
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    categoriesController.createCategory
  );

router.route("/:id")
  .get(categoriesController.getCategory)
  .patch(
   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    categoriesController.updateCategory
  )
  .delete(
   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    categoriesController.deleteCategory
  );

export const categoriesRoutes =  router;