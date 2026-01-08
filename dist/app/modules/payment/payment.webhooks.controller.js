"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentWebhooksController = exports.stripeWebhook = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const payment_services_1 = require("./payment.services");
const sendResponse_1 = require("../../utils/sendResponse");
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../../config/env");
/**
 * These endpoints should verify signatures from providers.
 * For demo, we accept a normalized body (you can adapt to real payloads).
 */
const stripe = new stripe_1.default(env_1.envVars.PAYMENT.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
});
exports.stripeWebhook = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, env_1.envVars.PAYMENT.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error("Stripe signature verification failed:", err.message);
        return (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.METHOD_FAILURE, success: true, message: "Unhandled event type", data: null });
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const normalized = {
            providerPaymentId: ((_a = session.payment_intent) !== null && _a !== void 0 ? _a : ""),
            providerSessionId: session.id,
            amount: session.amount_total || 0,
            currency: (session.currency || "USD").toUpperCase(),
            orderId: ((_c = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.orderId) !== null && _c !== void 0 ? _c : ""),
            userId: ((_e = (_d = session.metadata) === null || _d === void 0 ? void 0 : _d.userId) !== null && _e !== void 0 ? _e : ""),
            courseId: ((_j = (_g = (_f = session.metadata) === null || _f === void 0 ? void 0 : _f.courseId) !== null && _g !== void 0 ? _g : (_h = session.metadata) === null || _h === void 0 ? void 0 : _h.packageId) !== null && _j !== void 0 ? _j : ""),
        };
        const order = yield payment_services_1.PaymentService.markPaidFromWebhook("stripe", normalized);
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.OK,
            success: true,
            message: "Stripe webhook processed",
            data: order,
        });
    }
    console.log(`Unhandled Stripe event: ${event.type}`);
    return (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Unhandled event type", data: null });
}));
const paypalWebhook = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const normalized = {
        providerPaymentId: req.body.providerPaymentId,
        providerSessionId: req.body.providerSessionId,
        amount: req.body.amount,
        currency: req.body.currency,
        orderId: req.body.orderId,
        userId: req.body.userId,
        courseId: req.body.courseId
    };
    const order = yield payment_services_1.PaymentService.markPaidFromWebhook("paypal", normalized);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "PayPal webhook processed", data: order });
}));
const toyyibpayWebhook = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const normalized = {
        providerPaymentId: req.body.providerPaymentId,
        providerSessionId: req.body.providerSessionId,
        amount: req.body.amount,
        currency: req.body.currency,
        orderId: req.body.orderId,
        userId: req.body.userId,
        courseId: req.body.courseId
    };
    const order = yield payment_services_1.PaymentService.markPaidFromWebhook("toyyibpay", normalized);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "ToyyibPay webhook processed", data: order });
}));
exports.paymentWebhooksController = { stripeWebhook: exports.stripeWebhook, paypalWebhook, toyyibpayWebhook };
