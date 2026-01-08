"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = require("mongoose");
const event_interface_1 = require("./event.interface");
const eventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    organizer: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: Object.values(event_interface_1.EventStatus),
        default: event_interface_1.EventStatus.UPCOMING
    },
    pointsReward: { type: Number, default: 0 },
    badgeId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Badge" },
    attendees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
exports.Event = mongoose_1.models.Event || (0, mongoose_1.model)("Event", eventSchema);
