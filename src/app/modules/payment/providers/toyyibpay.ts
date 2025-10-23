import { IPaymentProvider } from "./base";
import { CreateSessionInput, CreateSessionResult } from "../payment.types";

export class ToyyibPayProvider implements IPaymentProvider {
  async createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    // TODO: call ToyyibPay bill API and return redirect
    return { sessionId: `fake_toyyib_${input.orderId}`, checkoutUrl: `https://toyyibpay.test/redirect/${input.orderId}` };
  }
}
