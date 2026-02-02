"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_routes_1 = require("../modules/user/user.routes");
const auth_route_1 = require("../modules/auth/auth.route");
const otp_routes_1 = require("../modules/otp/otp.routes");
const course_routes_1 = require("../modules/course/course.routes");
const unit_routes_1 = require("../modules/unit/unit.routes");
const lesson_routes_1 = require("../modules/lesson/lesson.routes");
const task_routes_1 = require("../modules/task/task.routes");
const submission_routes_1 = require("../modules/submission/submission.routes");
const certificate_routes_1 = require("../modules/certificate/certificate.routes");
const quize_routes_1 = require("../modules/quiz/quize.routes");
const enrollment_routes_1 = require("../modules/enrollment/enrollment.routes");
const order_routes_1 = require("../modules/order/order.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const package_routes_1 = require("../modules/Package/package.routes");
const event_route_1 = require("../modules/event/event.route");
const gamification_routes_1 = require("../modules/gamification/gamification.routes");
const badge_routes_1 = require("../modules/badge/badge.routes");
const upload_route_1 = require("../modules/upload/upload.route");
const product_routes_1 = require("../modules/ecom/product/product.routes");
const dashboard_routes_1 = require("../modules/dashboard/dashboard.routes");
const category_routes_1 = require("../modules/category/category.routes");
const city_routes_1 = require("../modules/city/city.routes");
const school_routes_1 = require("../modules/school/school.routes");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/user',
        route: user_routes_1.UserRoutes
    },
    {
        path: '/dashboard',
        route: dashboard_routes_1.DashboardRoutes
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes
    },
    {
        path: '/otp',
        route: otp_routes_1.OtpRoutes
    },
    {
        path: '/courses/categories',
        route: category_routes_1.categoriesRoutes
    },
    {
        path: '/courses',
        route: course_routes_1.CourseRoutes
    },
    {
        path: '/units',
        route: unit_routes_1.UnitRoutes
    },
    {
        path: '/lessons',
        route: lesson_routes_1.LessonRoutes
    },
    {
        path: '/tasks',
        route: task_routes_1.TaskRoutes
    },
    {
        path: '/submissions',
        route: submission_routes_1.SubmissionRoutes
    },
    {
        path: '/certificates',
        route: certificate_routes_1.CertificateRoutes
    },
    {
        path: '/quizzes',
        route: quize_routes_1.QuizRoutes
    },
    {
        path: '/enrollments',
        route: enrollment_routes_1.EnrollmentRoutes
    },
    {
        path: '/orders',
        route: order_routes_1.OrderRoutes
    },
    {
        path: '/payment',
        route: payment_routes_1.PaymentRoutes
    },
    {
        path: '/cities',
        route: city_routes_1.cityRoutes,
    },
    {
        path: '/schools',
        route: school_routes_1.schoolRoutes,
    },
    {
        path: '/packages',
        route: package_routes_1.PackageRoutes
    },
    {
        path: '/events',
        route: event_route_1.EventRoutes
    },
    {
        path: '/gamification',
        route: gamification_routes_1.GamificationRoutes
    },
    {
        path: '/badges',
        route: badge_routes_1.BadgeRoutes
    },
    {
        path: "/upload",
        route: upload_route_1.UploadRoutes
    },
    // {
    //     path: "/ecom/categories",
    //     route: CategoryRoutes
    // },
    {
        path: "/ecom/products",
        route: product_routes_1.ProductRoutes
    }
];
moduleRoutes.forEach(route => {
    exports.router.use(route.path, route.route);
});
