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
const markPaidFromWebhook = async (provider: "stripe" | "paypal" | "toyyibpay", normalized: {
    providerPaymentId: string;
    providerSessionId?: string;
    amount: number;
    currency: string;
    orderId: string;
    userId: string;
    courseId: string;
}) => {
    // idempotent: providerPaymentId must be unique
    const order = await Order.findById(normalized.orderId);
    if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order Not Found");

    // prevent cross-user/course
    // || String(order.course) !== normalized.courseId inside course check removed to allow package orders
    if (String(order.user) !== normalized.userId) {
        throw new AppError(httpStatus.BAD_REQUEST, "Order mismatch");
    }

    order.providerPaymentId = normalized.providerPaymentId;
    order.providerSessionId = normalized.providerSessionId ?? order.providerSessionId;
    order.status = "paid";
    await order.save();

    if (order.source === "ecommerce") {
    // TODO 1: decrement stock based on order.ecommerce.items
    // await ProductServices.decrementFromOrder(order);

    // TODO 2: clear cart for user
    // await CartServices.clear(String(order.user));

    // 3: award purchase points (simple policy)
    const points = Math.floor((order.amount || 0) / 10); // $10 => 1 point
    if (points > 0) {
      await GamificationServices.addPoints({
        userId: String(order.user),
        points,
        sourceType: "manual",
        reason: "Store purchase"
      });
    }
  }
    // Enroll the learner
    // await EnrollmentServices.enrollSelf(normalized.courseId, normalized.userId);
    if (order.itemType === "course") {
        await EnrollmentServices.enrollSelf(String(order.course?.id || order.course), normalized.userId);
    } else if (order.itemType === "package") {
        const list = order.courseIds || [];
        for (const courseId of list) {
            await EnrollmentServices.enrollSelf(courseId, normalized.userId);
        }
    }
    return order;
}
export const PaymentService = {
    createCheckoutSession,
    markPaidFromWebhook
};
