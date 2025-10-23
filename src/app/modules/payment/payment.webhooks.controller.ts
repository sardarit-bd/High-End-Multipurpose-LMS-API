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
    apiVersion: "2025-09-30.clover",
});

export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;
console.log(req.body);
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      envVars.PAYMENT.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Stripe signature verification failed:", err.message);
    return sendResponse(res, { statusCode: httpStatus.METHOD_FAILURE, success: true, message: "Unhandled event type", data: null });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const normalized = {
      providerPaymentId: (session.payment_intent ?? "") as string,
      providerSessionId: session.id,
      amount: session.amount_total || 0,
      currency: (session.currency || "USD").toUpperCase(),
      orderId: (session.metadata?.orderId ?? "") as string,
      userId: (session.metadata?.userId ?? "") as string,
      courseId: (session.metadata?.courseId ?? "") as string,
    };

    const order = await PaymentService.markPaidFromWebhook("stripe", normalized);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Stripe webhook processed",
      data: order,
    });
  }

  // অন্য ইভেন্ট থাকলে (refund, failed, ইত্যাদি) চাইলে পরে হ্যান্ডেল করুন
  console.log(`ℹ️ Unhandled Stripe event: ${event.type}`);
   return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Unhandled event type", data: null });
});

const paypalWebhook = catchAsync(async (req: Request, res: Response) => {
    const normalized = {
        providerPaymentId: req.body.providerPaymentId,
        providerSessionId: req.body.providerSessionId,
        amount: req.body.amount,
        currency: req.body.currency,
        orderId: req.body.orderId,
        userId: req.body.userId,
        courseId: req.body.courseId
    };
    const order = await PaymentService.markPaidFromWebhook("paypal", normalized);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "PayPal webhook processed", data: order });
});

const toyyibpayWebhook = catchAsync(async (req: Request, res: Response) => {
    const normalized = {
        providerPaymentId: req.body.providerPaymentId,
        providerSessionId: req.body.providerSessionId,
        amount: req.body.amount,
        currency: req.body.currency,
        orderId: req.body.orderId,
        userId: req.body.userId,
        courseId: req.body.courseId
    };
    const order = await PaymentService.markPaidFromWebhook("toyyibpay", normalized);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "ToyyibPay webhook processed", data: order });
});

export const paymentWebhooksController = { stripeWebhook, paypalWebhook, toyyibpayWebhook };
