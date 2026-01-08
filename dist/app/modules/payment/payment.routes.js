"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const payment_webhooks_controller_1 = require("./payment.webhooks.controller");
const router = (0, express_1.Router)();
// Public endpoints (providers call these); add raw body + signature verification in app.ts if needed
router.post("/webhooks/stripe", payment_webhooks_controller_1.paymentWebhooksController.stripeWebhook);
router.post("/webhooks/paypal", payment_webhooks_controller_1.paymentWebhooksController.paypalWebhook);
router.post("/webhooks/toyyibpay", payment_webhooks_controller_1.paymentWebhooksController.toyyibpayWebhook);
exports.PaymentRoutes = router;
