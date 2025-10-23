import { Router } from "express";
import { paymentWebhooksController } from "./payment.webhooks.controller";

const router = Router();

// Public endpoints (providers call these); add raw body + signature verification in app.ts if needed
router.post("/webhooks/stripe", paymentWebhooksController.stripeWebhook);
router.post("/webhooks/paypal", paymentWebhooksController.paypalWebhook);
router.post("/webhooks/toyyibpay", paymentWebhooksController.toyyibpayWebhook);

export const PaymentRoutes = router;
