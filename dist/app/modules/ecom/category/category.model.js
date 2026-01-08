"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category" },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
