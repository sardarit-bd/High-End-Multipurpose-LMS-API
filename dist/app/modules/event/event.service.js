"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const event_model_1 = require("./event.model");
const gamification_service_1 = require("../gamification/gamification.service"); // optional if already exists
const badge_service_1 = require("../badge/badge.service");
const order_services_1 = require("../order/order.services");
const create = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = new Date((_a = payload.eventDate) !== null && _a !== void 0 ? _a : Date.now());
    console.log(payload);
    const event = yield event_model_1.Event.create(Object.assign(Object.assign({}, payload), { organizer: userId }));
    return event;
});
const update = (eventId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(eventId, payload);
    const event = yield event_model_1.Event.findByIdAndUpdate(eventId, payload, { new: true });
    if (!event)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Event not found");
    return event;
});
const remove = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield event_model_1.Event.findByIdAndUpdate(eventId, { isDeleted: true }, { new: true });
    if (!event)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Event not found");
    return event;
});
const listPublic = () => __awaiter(void 0, void 0, void 0, function* () {
    return event_model_1.Event.find({ isDeleted: false }).sort({ startDate: 1 });
});
const get = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield event_model_1.Event.findOne({ _id: eventId, isDeleted: false });
    if (!event)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Event not found");
    return event;
});
const register = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const event = yield event_model_1.Event.findOne({ _id: eventId, isDeleted: false });
    if (!event)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Event not found");
    if ((_a = event.attendees) === null || _a === void 0 ? void 0 : _a.includes(userId))
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Already registered");
    (_b = event.attendees) === null || _b === void 0 ? void 0 : _b.push(userId);
    yield event.save();
    if (event.pointsReward > 0) {
        yield gamification_service_1.GamificationServices.addPoints({
            userId,
            points: event.pointsReward,
            sourceType: "event",
            eventId: String(event._id),
            reason: `Attended event: ${event.title.en || "Event"}`
        });
    }
    return event;
});
const markAttendance = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const event = yield event_model_1.Event.findById(eventId);
    if (!event)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Event not found");
    if (!((_a = event.attendees) === null || _a === void 0 ? void 0 : _a.includes(userId)))
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User not registered for this event");
    // Give points or badge (future integration)
    if (event.pointsReward > 0) {
        yield gamification_service_1.GamificationServices.addPoints({
            userId,
            points: event.pointsReward,
            sourceType: "event",
            eventId: String(event._id),
            reason: `Attended event: ${event.title.en || "Event"}`
        });
    }
    yield badge_service_1.BadgeServices.autoIssueBadge({ userId, totalPoints: 0, eventId: String(event._id) });
    return { message: "Attendance confirmed and points added", event };
});
const createCheckout = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const event = yield event_model_1.Event.findOne({ _id: eventId, isDeleted: { $ne: true } });
    if (!event)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Event not found");
    const amount = event.price;
    // Reuse OrderServices but for itemType "event"
    return order_services_1.OrderServices.createCheckoutForEvent({
        eventId: String(event._id),
        userId,
        amount,
        currency: event.currency || "USD",
        name: ((_a = event.title) === null || _a === void 0 ? void 0 : _a.en) || "Event"
    });
});
exports.EventServices = {
    create,
    update,
    remove,
    listPublic,
    get,
    register,
    markAttendance,
    createCheckout
};
