import { Types } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "canceled";
export type PaymentProvider = "stripe" | "paypal" | "toyyibpay";

export type OrderSource = "course" | "package" | "event" | "ecommerce";

export interface IOrderEcommerceItem {
    product: string;
    variantId?: string;
    qty: number;
    unitPrice: number;
    title: Record<string, string>;
    image?: string;
}

export interface IOrderEcommerce {
    items: IOrderEcommerceItem[];
    subtotal: number;
    discount?: number;
    shippingFee?: number;
    tax?: number;
    total: number;
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
    fulfillment: {
        status: "unfulfilled" | "processing" | "shipped" | "delivered" | "cancelled";
        trackingNumber?: string;
        carrier?: string;
        shippedAt?: Date;
        deliveredAt?: Date;
    };
}


export interface IOrder {
    _id?: Types.ObjectId;
    user: Types.ObjectId;
    itemType: OrderSource;
    courseIds?: string[];
    course?: Types.ObjectId;
    package?: Types.ObjectId;

    price: number;         // smallest unit (e.g., cents)
    currency: string;      // "USD","MYR","BDT", etc.

    provider: PaymentProvider;
    providerSessionId?: string;
    providerPaymentId?: string;
    status: OrderStatus;
    ecommerce?: IOrderEcommerce;
    couponCode?: string;
    meta?: Record<string, any>;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
