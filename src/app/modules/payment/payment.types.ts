export type Provider = "stripe" | "paypal" | "toyyibpay";

export type CreateSessionInput = {
  provider: Provider;
  orderId: string;
  amount: number;
  currency: string;
  courseId: string;
  userId: string;
};

export type CreateSessionResult = {
  sessionId: string;
  checkoutUrl: string | null;
};
