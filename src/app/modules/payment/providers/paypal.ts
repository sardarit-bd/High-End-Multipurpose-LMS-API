import { IPaymentProvider } from "./base";
import { CreateSessionInput, CreateSessionResult } from "../payment.types";

export class PaypalProvider implements IPaymentProvider {
  async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    // TODO: create PayPal order and return approval link
    return { sessionId: `fake_paypal_${input.orderId}`, checkoutUrl: `https://paypal.test/approve/${input.orderId}` };
  }
}
