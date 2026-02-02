import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { CourseRoutes } from "../modules/course/course.routes";
import { UnitRoutes } from "../modules/unit/unit.routes";
import { LessonRoutes } from "../modules/lesson/lesson.routes";
import { TaskRoutes } from "../modules/task/task.routes";
import { SubmissionRoutes } from "../modules/submission/submission.routes";
import { CertificateRoutes } from "../modules/certificate/certificate.routes";
import { QuizRoutes } from "../modules/quiz/quize.routes";
import { path } from "pdfkit";
import { EnrollmentRoutes } from "../modules/enrollment/enrollment.routes";
import { OrderRoutes } from "../modules/order/order.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { PackageRoutes } from "../modules/Package/package.routes";
import { EventRoutes } from "../modules/event/event.route";
import { GamificationRoutes } from "../modules/gamification/gamification.routes";
import { BadgeRoutes } from "../modules/badge/badge.routes";
import { UploadRoutes } from "../modules/upload/upload.route";
import { CategoryRoutes } from "../modules/ecom/category/category.routes";
import { ProductRoutes } from "../modules/ecom/product/product.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";
import { categoriesRoutes } from "../modules/category/category.routes";
import { cityRoutes } from "../modules/city/city.routes";
import { schoolRoutes } from "../modules/school/school.routes";


export const router = Router()

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/dashboard',
        route: DashboardRoutes
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
        path: '/courses/categories',
        route: categoriesRoutes
    },
    {
        path: '/courses',
        route: CourseRoutes
    },
    {
        path: '/units',
        route: UnitRoutes
    },
    {
        path: '/lessons',
        route: LessonRoutes
    },
    {
        path: '/tasks',
        route: TaskRoutes
    },
    {
        path: '/submissions',
        route: SubmissionRoutes
    },
    {
        path: '/certificates',
        route: CertificateRoutes
    },
    {
        path: '/quizzes',
        route: QuizRoutes
    },
    {
        path: '/enrollments',
        route: EnrollmentRoutes
    },
    {
        path: '/orders',
        route: OrderRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
    {
        path: '/cities',
        route: cityRoutes,
    },
    {
        path: '/schools',
        route: schoolRoutes,
    },
    {
        path: '/packages',
        route: PackageRoutes
    },
    {
        path: '/events',
        route: EventRoutes
    },
    {
        path: '/gamification',
        route: GamificationRoutes
    },
    {
        path: '/badges',
        route: BadgeRoutes
    },
    {
        path: "/upload",
        route: UploadRoutes
    },
    // {
    //     path: "/ecom/categories",
    //     route: CategoryRoutes
    // },
    {
        path: "/ecom/products",
        route: ProductRoutes
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})