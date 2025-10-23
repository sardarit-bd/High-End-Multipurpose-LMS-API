import { CreateSessionInput, CreateSessionResult } from "../payment.types";

export interface IPaymentProvider {
  createCheckoutSession(input: CreateSessionInput): Promise<CreateSessionResult>;
  // Called by webhook normalizer if needed (not strictly required)
}
