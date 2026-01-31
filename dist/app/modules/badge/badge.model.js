"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBadge = exports.Badge = void 0;
const mongoose_1 = require("mongoose");
const badgeSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    pointsRequired: { type: Number },
    isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });
const userBadgeSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    badge: { type: mongoose_1.Schema.Types.ObjectId, ref: "Badge", required: true },
    issuedAt: { type: Date, default: Date.now },
    reason: { type: String }
}, { timestamps: true, versionKey: false });
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });
exports.Badge = mongoose_1.models.Badge || (0, mongoose_1.model)("Badge", badgeSchema);
exports.UserBadge = mongoose_1.models.UserBadge || (0, mongoose_1.model)("UserBadge", userBadgeSchema);
