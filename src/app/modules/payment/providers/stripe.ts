import Stripe from "stripe";
import { IPaymentProvider } from "./base";
import { CreateSessionInput, CreateSessionResult } from "../payment.types";
import { envVars } from "../../../config/env"; 

export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(envVars.PAYMENT.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
  }

  async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amount, // 1999 = $19.99
            product_data: {
              name: `Course Enrollment #${input.courseId}`,
              description: "Enroll in SDG Learning Course",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${envVars.PAYMENT.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: envVars.PAYMENT.STRIPE_CANCEL_URL,
      metadata: {
        orderId: input.orderId,
        userId: input.userId,
        courseId: input.courseId,
      },
    });

    return { sessionId: session.id, checkoutUrl: session.url || null };
  }
}
