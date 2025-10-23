import { Router } from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { CourseRoutes } from "../modules/course/course.routes";
import { UnitRoutes } from "../modules/unit/unit.routes";
import { LessonRoutes } from "../modules/lesson/lesson.routes";
import { TaskRoutes } from "../modules/task/task.routes";
import { SubmissionRoutes } from "../modules/submission/submission.routes";
import { QuizRoutes } from "../modules/quiz/quize.routes";
import { path } from "pdfkit";
import { EnrollmentRoutes } from "../modules/enrollment/enrollment.routes";
import { OrderRoutes } from "../modules/order/order.routes";
import { PaymentRoutes } from "../modules/payment/payment.routes";


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
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})