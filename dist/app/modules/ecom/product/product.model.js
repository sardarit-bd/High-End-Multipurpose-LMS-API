"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
;
const variantSchema = new mongoose_1.Schema({
    name: String,
    sku: String,
    price: Number,
    stock: Number,
    attributes: { type: mongoose_1.Schema.Types.Mixed }
}, { _id: false });
const productSchema = new mongoose_1.Schema({
    title: { type: mongoose_1.Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "CourseCategory", required: true },
    images: [String],
    type: { type: String, enum: ["physical", "digital"], default: "physical" },
    price: Number,
    compareAtPrice: Number,
    featuredImage: String,
    stock: { type: Number, default: 0 },
    attributes: mongoose_1.Schema.Types.Mixed,
    shippingRequired: { type: Boolean, default: true },
    digitalUrl: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });
exports.Product = (0, mongoose_1.model)("Product", productSchema);
