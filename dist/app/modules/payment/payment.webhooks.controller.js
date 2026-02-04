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
    var _a, _b, _c, _d, _e, _f;
    console.log("🔄 Received Stripe webhook");
    console.log("Headers:", Object.keys(req.headers));
    console.log("Has stripe-signature:", !!req.headers["stripe-signature"]);
    console.log("Raw body available:", !!req.rawBody);
    console.log("Body type:", typeof req.body);
    const sig = req.headers["stripe-signature"];
    let event;
    if (!sig) {
        console.error("❌ Missing stripe-signature header");
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.BAD_REQUEST,
            success: false,
            message: "Missing stripe-signature header",
            data: null
        });
    }
    try {
        // Use the raw body stored by the middleware for signature verification
        const rawBody = req.rawBody || req.body;
        console.log("✅ Using raw body for signature verification, length:", rawBody.length);
        event = stripe.webhooks.constructEvent(rawBody, sig, env_1.envVars.PAYMENT.STRIPE_WEBHOOK_SECRET);
        console.log("✅ Stripe signature verified successfully, event type:", event.type);
    }
    catch (err) {
        console.error("❌ Stripe signature verification failed:", err.message);
        console.error("Error details:", err);
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.BAD_REQUEST,
            success: false,
            message: "Webhook signature verification failed",
            data: null
        });
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("📋 Processing Stripe checkout.session.completed");
        console.log("Session ID:", session.id);
        console.log("Metadata:", session.metadata);
        console.log("Raw session data:", session);
        const normalized = {
            providerPaymentId: ((_a = session.payment_intent) !== null && _a !== void 0 ? _a : ""),
            providerSessionId: session.id,
            amount: session.amount_total || 0,
            currency: (session.currency || "USD").toUpperCase(),
            orderId: (((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.orderId) || "").trim(),
            userId: (((_c = session.metadata) === null || _c === void 0 ? void 0 : _c.userId) || "").trim(),
            courseId: (((_d = session.metadata) === null || _d === void 0 ? void 0 : _d.courseId) || ((_e = session.metadata) === null || _e === void 0 ? void 0 : _e.packageId) || "").trim(),
            eventId: (((_f = session.metadata) === null || _f === void 0 ? void 0 : _f.eventId) || "").trim(),
        };
        // Validate required fields
        if (!normalized.orderId || !normalized.userId) {
            console.error("❌ Stripe webhook missing required metadata:", { orderId: normalized.orderId, userId: normalized.userId });
            return (0, sendResponse_1.sendResponse)(res, {
                statusCode: http_status_codes_1.default.BAD_REQUEST,
                success: false,
                message: "Missing required order or user metadata",
                data: null
            });
        }
        console.log("✅ Stripe webhook data normalized:", normalized);
        try {
            const order = yield payment_services_1.PaymentService.markPaidFromWebhook("stripe", normalized);
            console.log("✅ Stripe webhook processed successfully, order marked as paid");
            return (0, sendResponse_1.sendResponse)(res, {
                statusCode: http_status_codes_1.default.OK,
                success: true,
                message: "Stripe webhook processed",
                data: order,
            });
        }
        catch (error) {
            console.error("❌ Error processing Stripe webhook:", error.message);
            return (0, sendResponse_1.sendResponse)(res, {
                statusCode: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Error processing payment",
                data: null
            });
        }
    }
    console.log(`Unhandled Stripe event: ${event.type}`);
    return (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Unhandled event type", data: null });
}));
const paypalWebhook = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔄 Received PayPal webhook");
    // Basic validation for PayPal webhook
    const requiredFields = ['providerPaymentId', 'providerSessionId', 'amount', 'currency', 'orderId', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        console.error("❌ PayPal webhook missing required fields:", missingFields);
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.BAD_REQUEST,
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
            data: null
        });
    }
    const normalized = {
        providerPaymentId: req.body.providerPaymentId,
        providerSessionId: req.body.providerSessionId,
        amount: Number(req.body.amount),
        currency: String(req.body.currency).toUpperCase(),
        orderId: String(req.body.orderId),
        userId: String(req.body.userId),
        courseId: req.body.courseId ? String(req.body.courseId) : undefined
    };
    console.log("✅ PayPal webhook data normalized:", normalized);
    const order = yield payment_services_1.PaymentService.markPaidFromWebhook("paypal", normalized);
    console.log("✅ PayPal webhook processed successfully");
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "PayPal webhook processed", data: order });
}));
const toyyibpayWebhook = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔄 Received ToyyibPay webhook");
    // Basic validation for ToyyibPay webhook
    const requiredFields = ['providerPaymentId', 'providerSessionId', 'amount', 'currency', 'orderId', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        console.error("❌ ToyyibPay webhook missing required fields:", missingFields);
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.BAD_REQUEST,
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
            data: null
        });
    }
    const normalized = {
        providerPaymentId: req.body.providerPaymentId,
        providerSessionId: req.body.providerSessionId,
        amount: Number(req.body.amount),
        currency: String(req.body.currency).toUpperCase(),
        orderId: String(req.body.orderId),
        userId: String(req.body.userId),
        courseId: req.body.courseId ? String(req.body.courseId) : undefined
    };
    console.log("✅ ToyyibPay webhook data normalized:", normalized);
    const order = yield payment_services_1.PaymentService.markPaidFromWebhook("toyyibpay", normalized);
    console.log("✅ ToyyibPay webhook processed successfully");
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "ToyyibPay webhook processed", data: order });
}));
exports.paymentWebhooksController = { stripeWebhook: exports.stripeWebhook, paypalWebhook, toyyibpayWebhook };
