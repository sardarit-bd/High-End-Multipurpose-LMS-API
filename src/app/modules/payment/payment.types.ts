export type Provider = "stripe" | "paypal" | "toyyibpay";
export type PaymentSource = "course" | "package" | "event" | "ecommerce";

export type CreateSessionInput = {
  provider: Provider;
  source: PaymentSource;
  userId: string;

  orderId: string;
  amount: number;
  currency: string;
  courseId?: string;
  packageId?: string;
  eventId?: string;


  cart?: boolean;
  shippingAddress?: {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postcode?: string;
    country: string;
  };
};

export type CreateSessionResult = {
  sessionId: string;
  checkoutUrl: string | null;
  // orderId: string;
};
