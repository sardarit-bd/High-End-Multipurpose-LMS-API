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
exports.PaymentService = void 0;
const stripe_1 = require("./providers/stripe");
const paypal_1 = require("./providers/paypal");
const toyyibpay_1 = require("./providers/toyyibpay");
const order_model_1 = require("../order/order.model");
const enrollment_services_1 = require("../enrollment/enrollment.services");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const gamification_service_1 = require("../gamification/gamification.service");
const product_model_1 = require("../ecom/product/product.model");
const course_model_1 = require("../course/course.model");
const event_model_1 = require("../event/event.model");
const providers = {
    stripe: new stripe_1.StripeProvider(),
    paypal: new paypal_1.PaypalProvider(),
    toyyibpay: new toyyibpay_1.ToyyibPayProvider()
};
const createCheckoutSession = (input) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating checkout session with input:", input);
    const p = providers[input.provider];
    if (!p)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Unsupported provider");
    return p.createCheckoutSession(input);
});
// Webhook handlers (normalized)
const markPaidFromWebhook = (provider, normalized) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const order = yield order_model_1.Order.findById(normalized.orderId);
    let course, event;
    if (normalized.courseId) {
        course = yield course_model_1.Course.findById(normalized.courseId);
    }
    if (normalized.eventId) {
        event = yield event_model_1.Event.findById(normalized.eventId);
    }
    if (!order) {
        console.error(`❌ Order not found: ${normalized.orderId}`);
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, `Order not found: ${normalized.orderId}`);
    }
    // Prevent cross-user tampering
    if (String(order.user) !== normalized.userId) {
        console.error(`❌ Order user mismatch - Order user: ${order.user}, Webhook user: ${normalized.userId}`);
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Order does not belong to this user");
    }
    // Check if order is already paid (idempotent)
    if (order.status === "paid") {
        console.log(`⚠️ Order ${normalized.orderId} already marked as paid, skipping`);
        return order;
    }
    // Validate payment amount (for Stripe, amount is in cents)
    const expectedAmount = provider === "stripe" ? order.price * 100 : order.price;
    if (Math.abs(normalized.amount - expectedAmount) > 1) { // Allow 1 cent/unit difference for rounding
        console.error(`❌ Amount mismatch - Expected: ${expectedAmount}, Received: ${normalized.amount}`);
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment amount does not match order amount");
    }
    // Mark order as paid (idempotent update)
    order.providerPaymentId = normalized.providerPaymentId;
    order.providerSessionId = (_a = normalized.providerSessionId) !== null && _a !== void 0 ? _a : order.providerSessionId;
    order.status = "paid";
    yield order.save();
    /* --------------------------------------------------------------------
     * 🛍️ HANDLE ECOMMERCE ORDER
     * ------------------------------------------------------------------ */
    if (order.itemType === "ecommerce" && ((_c = (_b = order.ecommerce) === null || _b === void 0 ? void 0 : _b.items) === null || _c === void 0 ? void 0 : _c.length)) {
        for (const item of order.ecommerce.items) {
            const prod = yield product_model_1.Product.findById(item.product);
            if (!prod)
                continue;
            prod.stock = Math.max(0, (prod.stock || 0) - item.qty);
            yield prod.save();
        }
        const points = Math.floor((order.amount || 0) / 10); // $10 => 1 point
        if (points > 0) {
            yield gamification_service_1.GamificationServices.addPoints({
                userId: String(order.user),
                points,
                sourceType: order.itemType,
                reason: "Store purchase",
            });
        }
        // 3d. Mark fulfillment pending
        order.ecommerce.fulfillment.status = "pending";
        yield order.save();
    }
    /* --------------------------------------------------------------------
     * 🎓 HANDLE COURSE / PACKAGE ENROLLMENT
     * ------------------------------------------------------------------ */
    if (order.itemType === "course" && order.course) {
        yield enrollment_services_1.EnrollmentServices.enrollSelf(String(order.course), normalized.userId, course.instructor);
        // Optional: auto-award enrollment points
        yield gamification_service_1.GamificationServices.addPoints({
            userId: normalized.userId,
            points: 20,
            sourceType: order.itemType,
            courseId: String(order.course),
            reason: "Course enrollment",
        });
        yield course_model_1.Course.findByIdAndUpdate(normalized.courseId, {
            $inc: { noOfStudents: 1 },
        }, { new: true });
    }
    else if (order.itemType === "package" && ((_d = order.courseIds) === null || _d === void 0 ? void 0 : _d.length)) {
        // Multiple course package purchase
        for (const courseId of order.courseIds) {
            course = yield course_model_1.Course.findById(courseId);
            yield enrollment_services_1.EnrollmentServices.enrollSelf(String(courseId), normalized.userId, course.instructor);
            yield course_model_1.Course.findByIdAndUpdate(courseId, {
                $inc: { noOfStudents: 1 },
            }, { new: true });
        }
        yield gamification_service_1.GamificationServices.addPoints({
            userId: normalized.userId,
            points: 50,
            sourceType: order.itemType,
            reason: "Package purchase and enrollment",
        });
    }
    if (order.itemType === "event") {
        console.log("Enrolling for event:", event);
        event.attendees = event.attendees || [];
        if (!event.attendees.includes(normalized.userId)) {
            event.attendees.push(normalized.userId);
            yield event.save();
        }
        // Optional: auto-award enrollment points
        yield gamification_service_1.GamificationServices.addPoints({
            userId: normalized.userId,
            points: event.pointsReward || 0,
            sourceType: order.itemType,
            eventId: String(event._id),
            reason: "Registered for event",
        });
    }
    /* --------------------------------------------------------------------
     * 📜 Audit Log (optional)
     * ------------------------------------------------------------------ */
    // await ActivityLogServices.record({
    //   userId: normalized.userId,
    //   action: "payment_completed",
    //   referenceId: order._id,
    //   meta: { provider, amount: order.amount, currency: order.currency },
    // });
    return order;
});
exports.PaymentService = {
    createCheckoutSession,
    markPaidFromWebhook
};
