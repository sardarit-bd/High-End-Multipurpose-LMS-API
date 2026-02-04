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
exports.StripeProvider = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../../../config/env");
class StripeProvider {
    constructor() {
        this.stripe = new stripe_1.default(env_1.envVars.PAYMENT.STRIPE_SECRET_KEY, {
            apiVersion: "2025-10-29.clover",
        });
    }
    createCheckoutSession(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const params = {
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [
                    {
                        price_data: {
                            currency: ((_a = input.currency) !== null && _a !== void 0 ? _a : "usd").toLowerCase(),
                            unit_amount: (_b = Math.round(input.amount)) !== null && _b !== void 0 ? _b : 0, // 1999 = $19.99
                            product_data: {
                                name: `Course Enrollment #${input.courseId}`,
                                description: "Enroll in SDG Learning Course",
                            },
                        },
                        quantity: 1,
                    },
                ],
                success_url: `${env_1.envVars.PAYMENT.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: env_1.envVars.PAYMENT.STRIPE_CANCEL_URL,
                metadata: {
                    orderId: input.orderId || "",
                    userId: input.userId || "",
                    courseId: input.courseId || "",
                    packageId: input.packageId || "",
                    eventId: input.eventId || "",
                },
            };
            const session = yield this.stripe.checkout.sessions.create(params);
            return { sessionId: session.id, checkoutUrl: (_c = session.url) !== null && _c !== void 0 ? _c : null };
        });
    }
}
exports.StripeProvider = StripeProvider;
