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
    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (input.currency ?? "usd").toLowerCase(),
            unit_amount: Math.round(input.amount) ?? 0, // 1999 = $19.99
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
        orderId: input.orderId ?? null,
        userId: input.userId ?? null,
        courseId: input.courseId ?? null,
      },
    };

    const session = await this.stripe.checkout.sessions.create(params);

    return { sessionId: session.id, checkoutUrl: session.url ?? null };
  }
}
