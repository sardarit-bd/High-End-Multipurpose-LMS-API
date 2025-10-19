import { NextFunction, Request, Response, Router } from "express";

import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/logout", AuthControllers.logout);

router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthControllers.changePassword
);

router.post("/forgot-password", AuthControllers.forgotPassword);

router.get(
    "/google",
    async (req: Request, res: Response, next: NextFunction) => {
        const redirect = req.query.redirect || "/";
        passport.authenticate("google", {
            scope: ["profile", "email"],
            state: redirect as string,
        })(req, res, next);
    }
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please Contact with our support team.`,
    }),
    AuthControllers.googleCallbackController
);

export const AuthRoutes = router;