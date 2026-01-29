/* eslint-disable @typescript-eslint/no-unused-vars */
import { CreateSessionInput } from "./payment.types";
import { StripeProvider } from "./providers/stripe";
import { PaypalProvider } from "./providers/paypal";
import { ToyyibPayProvider } from "./providers/toyyibpay";
import { Order } from "../order/order.model";
import { EnrollmentServices } from "../enrollment/enrollment.services";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { GamificationServices } from "../gamification/gamification.service";
import { Product } from "../ecom/product/product.model";
import { Course } from "../course/course.model";

const providers = {
  stripe: new StripeProvider(),
  paypal: new PaypalProvider(),
  toyyibpay: new ToyyibPayProvider()
} as const;

const createCheckoutSession = async (input: CreateSessionInput) => {
  const p = providers[input.provider];
  if (!p) throw new AppError(httpStatus.BAD_REQUEST, "Unsupported provider");
  return p.createCheckoutSession(input);
}

// Webhook handlers (normalized)
const markPaidFromWebhook = async (
  provider: "stripe" | "paypal" | "toyyibpay",
  normalized: {
    providerPaymentId: string;
    providerSessionId?: string;
    amount: number;
    currency: string;
    orderId: string;
    userId: string;
    courseId?: string;
  }
) => {
  console.log(`💰 Processing ${provider} webhook payment for order: ${normalized.orderId}`);

  // Validate order existence
  const order = await Order.findById(normalized.orderId);
  const course = await Course.findById(normalized.courseId)
  if (!order) {
    console.error(`❌ Order not found: ${normalized.orderId}`);
    throw new AppError(httpStatus.NOT_FOUND, `Order not found: ${normalized.orderId}`);
  }

  // Prevent cross-user tampering
  if (String(order.user) !== normalized.userId) {
    console.error(`❌ Order user mismatch - Order user: ${order.user}, Webhook user: ${normalized.userId}`);
    throw new AppError(httpStatus.BAD_REQUEST, "Order does not belong to this user");
  }

  // Check if order is already paid (idempotent)
  if (order.status === "paid") {
    console.log(`⚠️ Order ${normalized.orderId} already marked as paid, skipping`);
    return order;
  }

  // Validate payment amount (for Stripe, amount is in cents)
  const expectedAmount = provider === "stripe" ? order.price * 100 : order.price;
  if (Math.abs(normalized.amount - expectedAmount) > 1) { // Allow 1 cent/unit difference for rounding
    console.error(`❌ Amount mismatch - Expected: ${expectedAmount}, Received: ${normalized.amount}`);
    throw new AppError(httpStatus.BAD_REQUEST, "Payment amount does not match order amount");
  }

  console.log(`✅ Amount validation passed - Expected: ${expectedAmount}, Received: ${normalized.amount}`);

  // Mark order as paid (idempotent update)
  order.providerPaymentId = normalized.providerPaymentId;
  order.providerSessionId = normalized.providerSessionId ?? order.providerSessionId;
  order.status = "paid";
  await order.save();

  /* --------------------------------------------------------------------
   * 🛍️ HANDLE ECOMMERCE ORDER
   * ------------------------------------------------------------------ */
  if (order.source === "ecommerce" && order.ecommerce?.items?.length) {
    // 3a. Decrement product stock
    for (const item of order.ecommerce.items) {
      const prod: any = await Product.findById(item.product);
      if (!prod) continue;

      if (item.variantId && Array.isArray(prod.variants)) {
        const idx = prod.variants.findIndex((v: any) => String(v._id) === String(item.variantId));
        if (idx >= 0) {
          prod.variants[idx].stock = Math.max(0, (prod.variants[idx].stock || 0) - item.qty);
        }
      } else {
        prod.stock = Math.max(0, (prod.stock || 0) - item.qty);
      }
      await prod.save();
    }

    // 3b. (Optional) clear frontend cart if stored server-side
    // await CartServices.clear(String(order.user));

    // 3c. Award purchase points (basic gamification)
    const points = Math.floor((order.amount || 0) / 10); // $10 => 1 point
    if (points > 0) {
      await GamificationServices.addPoints({
        userId: String(order.user),
        points,
        sourceType: order.itemType,
        reason: "Store purchase",
      });
    }

    // 3d. Mark fulfillment pending
    order.ecommerce.fulfillment.status = "pending";
    await order.save();
  }

  /* --------------------------------------------------------------------
   * 🎓 HANDLE COURSE / PACKAGE ENROLLMENT
   * ------------------------------------------------------------------ */
  if (order.itemType === "course" && order.course) {
    // Single course purchase
    console.log(course, course?.instructor)
    await EnrollmentServices.enrollSelf(String(order.course), normalized.userId, course.instructor);

    // Optional: auto-award enrollment points
    await GamificationServices.addPoints({
      userId: normalized.userId,
      points: 20,
      sourceType: order.itemType,
      courseId: String(order.course),
      reason: "Course enrollment",
    });
    await Course.findByIdAndUpdate(
      normalized.courseId,
      {
        $inc: { noOfStudents: 1 },
      },
      { new: true }
    );
  } else if (order.itemType === "package" && order.courseIds?.length) {
    // Multiple course package purchase
    for (const courseId of order.courseIds) {
      await EnrollmentServices.enrollSelf(String(courseId), normalized.userId, course.instructor);
      await Course.findByIdAndUpdate(
        courseId,
        {
          $inc: { noOfStudents: 1 },
        },
        { new: true }
      );
    }

    await GamificationServices.addPoints({
      userId: normalized.userId,
      points: 50,
      sourceType: order.itemType,
      reason: "Package purchase and enrollment",
    });
  }

  /* --------------------------------------------------------------------
   * 📜 Audit Log (optional)
   * ------------------------------------------------------------------ */
  // await ActivityLogServices.record({
  //   userId: normalized.userId,
  //   action: "payment_completed",
  //   referenceId: order._id,
  //   meta: { provider, amount: order.amount, currency: order.currency },
  // });

  return order;
};

export const PaymentService = {
  createCheckoutSession,
  markPaidFromWebhook
};
