// app/modules/city/city.routes.ts
import express from "express";
import { CityController } from "./city.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CityController.create
);

router.get("/", CityController.listAll);

router.get("/:cityId", CityController.getById);

router.patch(
    "/:cityId",
   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CityController.update
);

router.patch(
    "/:cityId/toggle-status",
   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CityController.toggleStatus
);

router.delete("/:cityId", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), CityController.remove);

export const cityRoutes = router;