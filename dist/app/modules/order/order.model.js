"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
const orderEcommerceItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product" },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    title: { type: mongoose_1.Schema.Types.Mixed, required: true },
    image: { type: String }
}, { _id: false, versionKey: false });
const orderEcommerceSchema = new mongoose_1.Schema({
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
const OrderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemType: { type: String, enum: ["course", "package", "event", "ecommerce", "Donation"], required: true },
    package: { id: { type: String }, name: { type: mongoose_1.Schema.Types.Mixed } },
    course: { type: String },
    fund: { type: String },
    courseIds: [{ type: String }],
    billingInfo: { type: Object },
    event: { type: mongoose_1.Schema.Types.ObjectId, ref: "Event" },
    ecommerce: { type: orderEcommerceSchema },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    provider: { type: String, required: true },
    providerSessionId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "canceled"], default: "pending", index: true },
    couponCode: { type: String },
    meta: { type: mongoose_1.Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
// OrderSchema.index({ user: 1, course: 1, status: 1 });
// OrderSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true, sparse: true });
exports.Order = mongoose_1.models.Order || (0, mongoose_1.model)("Order", OrderSchema);
