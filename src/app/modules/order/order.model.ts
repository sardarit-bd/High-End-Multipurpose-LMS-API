import { Schema, model, models } from "mongoose";
import { IOrder } from "./order.interface";

const OrderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemType: { type: String, enum: ["course", "package"], required: true, index: true },
    package: { id: { type: String }, name: { type: Schema.Types.Mixed } },
    course: { id: { type: String } },
    courseIds: [{ type: String }],


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
