import { Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "canceled";
export type PaymentProvider = "stripe" | "paypal" | "toyyibpay";
export type OrderItemType = "course" | "package";

export interface IOrder {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    itemType: OrderItemType;
    courseIds?: string[];
    course?: Types.ObjectId;
    package?: Types.ObjectId;

    price: number;         // smallest unit (e.g., cents)
    currency: string;      // "USD","MYR","BDT", etc.

    provider: PaymentProvider;
    providerSessionId?: string;
    providerPaymentId?: string;
    status: OrderStatus;

    couponCode?: string;
    meta?: Record<string, any>;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
