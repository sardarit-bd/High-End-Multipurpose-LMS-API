import { Schema, model, models } from "mongoose";
import { IOrder } from "./order.interface";
const orderEcommerceItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    variantId: { type: Schema.Types.ObjectId },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    title: { type: Schema.Types.Mixed, required: true },
    image: { type: String }
}, { _id: false, versionKey: false });

const orderEcommerceSchema = new Schema({
    items: [orderEcommerceItemSchema],
    subtotal: Number,
    discount: Number,
    shippingFee: Number,
    tax: Number,
    total: Number,
    shippingAddress: {
        name: String, phone: String, line1: String, line2: String,
        city: String, state: String, postcode: String, country: String
    },
    fulfillment: {
        status: { type: String, enum: ["unfulfilled", "processing", "shipped", "delivered", "cancelled"], default: "unfulfilled" },
        trackingNumber: String,
        carrier: String,
        shippedAt: Date,
        deliveredAt: Date
    }
}, { _id: false, versionKey: false });

const OrderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemType: { type: String, enum: ["course", "package", "event", "ecommerce"], required: true },
    package: { id: { type: String }, name: { type: Schema.Types.Mixed } },
    course: { type: String },
    courseIds: [{ type: String }],

    ecommerce: { type: orderEcommerceSchema },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    provider: { type: String, enum: ["stripe", "paypal", "toyyibpay"], required: true },
    providerSessionId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "canceled"], default: "pending", index: true },
    couponCode: { type: String },
    meta: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

OrderSchema.index({ user: 1, course: 1, status: 1 });
OrderSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true, sparse: true });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
