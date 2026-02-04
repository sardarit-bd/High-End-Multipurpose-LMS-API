"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    eventDate: { type: Date, required: true },
    location: { type: String },
    organizer: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    price: { type: Number, required: true },
    pointsReward: { type: Number, default: 0 },
    attendees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    thumbnail: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
exports.Event = mongoose_1.models.Event || (0, mongoose_1.model)("Event", eventSchema);
