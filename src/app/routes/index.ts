import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { CourseRoutes } from "../modules/course/course.routes";
import { path } from "pdfkit";
import { UnitRoutes } from "../modules/unit/unit.routes";


export const router = Router()

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/otp',
        route: OtpRoutes
    },
    {
        path: '/courses',
        route: CourseRoutes
    },
    {
        path: '/units',
        route: UnitRoutes
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})