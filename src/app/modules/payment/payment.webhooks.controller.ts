/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.services";
import { sendResponse } from "../../utils/sendResponse";
import Stripe from "stripe";
import { envVars } from "../../config/env";

/**
 * These endpoints should verify signatures from providers.
 * For demo, we accept a normalized body (you can adapt to real payloads).
 */


const stripe = new Stripe(envVars.PAYMENT.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
});

export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  console.log("🔄 Received Stripe webhook");
  console.log("Headers:", Object.keys(req.headers));
  console.log("Has stripe-signature:", !!req.headers["stripe-signature"]);
  console.log("Raw body available:", !!(req as any).rawBody);
  console.log("Body type:", typeof req.body);

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Missing stripe-signature header",
      data: null
    });
  }

  try {
    // Use the raw body stored by the middleware for signature verification
    const rawBody = (req as any).rawBody || req.body;
    console.log("✅ Using raw body for signature verification, length:", rawBody.length);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      envVars.PAYMENT.STRIPE_WEBHOOK_SECRET
    );
    console.log("✅ Stripe signature verified successfully, event type:", event.type);
  } catch (err: any) {
    console.error("❌ Stripe signature verification failed:", err.message);
    console.error("Error details:", err);
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Webhook signature verification failed",
      data: null
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("📋 Processing Stripe checkout.session.completed");
    console.log("Session ID:", session.id);
    console.log("Metadata:", session.metadata);

    console.log("Raw session data:", session);
    const normalized = {
      providerPaymentId: (session.payment_intent ?? "") as string,
      providerSessionId: session.id,
      amount: session.amount_total || 0,
      currency: (session.currency || "USD").toUpperCase(),
      orderId: (session.metadata?.orderId || "").trim(),
      userId: (session.metadata?.userId || "").trim(),
      courseId: (session.metadata?.courseId || session.metadata?.packageId || "").trim(),
      eventId: (session.metadata?.eventId || "").trim(),
    };

    // Validate required fields
    if (!normalized.orderId || !normalized.userId) {
      console.error("❌ Stripe webhook missing required metadata:", { orderId: normalized.orderId, userId: normalized.userId });
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "Missing required order or user metadata",
        data: null
      });
    }

    console.log("✅ Stripe webhook data normalized:", normalized);

    try {
      const order = await PaymentService.markPaidFromWebhook("stripe", normalized);
      console.log("✅ Stripe webhook processed successfully, order marked as paid");

      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Stripe webhook processed",
        data: order,
      });
    } catch (error: any) {
      console.error("❌ Error processing Stripe webhook:", error.message);
      return sendResponse(res, {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Error processing payment",
        data: null
      });
    }
  }

  
  console.log(`Unhandled Stripe event: ${event.type}`);
   return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Unhandled event type", data: null });
});

const paypalWebhook = catchAsync(async (req: Request, res: Response) => {
    console.log("🔄 Received PayPal webhook");

    // Basic validation for PayPal webhook
    const requiredFields = ['providerPaymentId', 'providerSessionId', 'amount', 'currency', 'orderId', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        console.error("❌ PayPal webhook missing required fields:", missingFields);
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
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
    const order = await PaymentService.markPaidFromWebhook("paypal", normalized);
    console.log("✅ PayPal webhook processed successfully");

    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "PayPal webhook processed", data: order });
});

const toyyibpayWebhook = catchAsync(async (req: Request, res: Response) => {
    console.log("🔄 Received ToyyibPay webhook");

    // Basic validation for ToyyibPay webhook
    const requiredFields = ['providerPaymentId', 'providerSessionId', 'amount', 'currency', 'orderId', 'userId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        console.error("❌ ToyyibPay webhook missing required fields:", missingFields);
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
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
    const order = await PaymentService.markPaidFromWebhook("toyyibpay", normalized);
    console.log("✅ ToyyibPay webhook processed successfully");

    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "ToyyibPay webhook processed", data: order });
});

export const paymentWebhooksController = { stripeWebhook, paypalWebhook, toyyibpayWebhook };
