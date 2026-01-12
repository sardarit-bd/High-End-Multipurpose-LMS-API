"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const env_1 = require("./app/config/env");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = require("./app/middlewares/notFound");
const routes_1 = require("./app/routes");
require("./app/config/passport");
const payment_webhooks_controller_1 = require("./app/modules/payment/payment.webhooks.controller");
const connectDatabase_1 = require("./app/middlewares/connectDatabase");
const app = (0, express_1.default)();
// CRITICAL: Webhook routes MUST be defined BEFORE any body parsing middleware
// Stripe needs the raw request body for signature verification
app.post("/webhooks/stripe", express_1.default.raw({ type: "application/json", verify: (req, res, buf) => {
        // Store raw body for Stripe signature verification
        req.rawBody = buf;
    } }), payment_webhooks_controller_1.stripeWebhook);
app.get("/webhooks/stripe", (req, res) => {
    res.status(200).json({
        message: "I am from stripe webhook GET endpoint",
    });
});
// Now apply all other middleware AFTER webhook routes
app.use((0, express_session_1.default)({
    secret: env_1.envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set("trust proxy", 1);
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: env_1.envVars.FRONTEND_URL, // use array to allow multiple origins
    credentials: true,
}));
app.use("/api", (0, connectDatabase_1.connectDatabase)(), routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LMS API",
    });
});
app.use(globalErrorHandler_1.globalErrorHandle);
app.use(notFound_1.notFound);
exports.default = app;
