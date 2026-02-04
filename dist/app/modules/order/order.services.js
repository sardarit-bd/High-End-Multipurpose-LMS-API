"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.OrderServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const order_model_1 = require("./order.model");
const course_model_1 = require("../course/course.model");
const product_model_1 = require("../ecom/product/product.model");
const payment_services_1 = require("../payment/payment.services");
const mongoose_1 = require("mongoose");
const gamification_service_1 = require("../gamification/gamification.service");
const assertAdmin = (actor) => {
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Admin only");
};
const ensureOrder = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.Types.ObjectId.isValid(orderId)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid order id");
    }
    const ord = yield order_model_1.Order.findById(orderId);
    if (!ord)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Order not found");
    return ord;
});
/** Admin: mark e-commerce order as shipped/processing (sets tracking optionally) */
const fulfillEcommerceOrder = (orderId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    assertAdmin(actor);
    const ord = yield ensureOrder(orderId);
    if (ord.itemType !== "ecommerce")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only e-commerce orders can be fulfilled");
    if (ord.status !== "paid")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only paid orders can be fulfilled");
    // Initialize subdoc if missing
    ord.ecommerce = ord.ecommerce || {};
    ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || {};
    // Update fields
    ord.ecommerce.fulfillment.status = (payload === null || payload === void 0 ? void 0 : payload.status) || "shipped";
    if (payload === null || payload === void 0 ? void 0 : payload.trackingNumber)
        ord.ecommerce.fulfillment.trackingNumber = payload === null || payload === void 0 ? void 0 : payload.trackingNumber;
    if (payload === null || payload === void 0 ? void 0 : payload.carrier)
        ord.ecommerce.fulfillment.carrier = payload === null || payload === void 0 ? void 0 : payload.carrier;
    if ((payload === null || payload === void 0 ? void 0 : payload.status) === "shipped")
        ord.ecommerce.fulfillment.shippedAt = new Date();
    yield ord.save();
    return ord;
});
/** Admin: update tracking (optionally bump status to shipped/processing) */
const updateEcommerceTracking = (orderId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    assertAdmin(actor);
    const ord = yield ensureOrder(orderId);
    if (ord.itemType !== "ecommerce")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only e-commerce orders can be tracked");
    if (ord.status !== "paid")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only paid orders can be tracked");
    ord.ecommerce = ord.ecommerce || {};
    ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || {};
    ord.ecommerce.fulfillment.trackingNumber = payload.trackingNumber;
    if (payload.carrier)
        ord.ecommerce.fulfillment.carrier = payload.carrier;
    if (payload.status) {
        ord.ecommerce.fulfillment.status = payload.status;
        if (payload.status === "shipped")
            ord.ecommerce.fulfillment.shippedAt = new Date();
    }
    yield ord.save();
    return ord;
});
/** Admin: mark delivered (idempotent) */
const markEcommerceDelivered = (orderId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    assertAdmin(actor);
    const ord = yield ensureOrder(orderId);
    if (ord.itemType !== "ecommerce")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only e-commerce orders can be delivered");
    if (ord.status !== "paid")
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Only paid orders can be delivered");
    ord.ecommerce = ord.ecommerce || {};
    ord.ecommerce.fulfillment = ord.ecommerce.fulfillment || {};
    // If already delivered, return as-is (idempotent)
    if (ord.ecommerce.fulfillment.status === "delivered")
        return ord;
    ord.ecommerce.fulfillment.status = "delivered";
    ord.ecommerce.fulfillment.deliveredAt = (payload === null || payload === void 0 ? void 0 : payload.deliveredAt)
        ? new Date(payload === null || payload === void 0 ? void 0 : payload.deliveredAt)
        : new Date();
    yield ord.save();
    // Optional: tiny bonus points for delivered orders
    const bonus = Math.max(1, Math.floor((ord.amount || 0) / 100)); // e.g., 1pt per $100
    if (bonus > 0) {
        yield gamification_service_1.GamificationServices.addPoints({
            userId: String(ord.user),
            points: bonus,
            sourceType: "purchase",
            reason: "Order delivered bonus",
        });
    }
    return ord;
});
/** Admin: cancel order (stub). If you want refunds, integrate provider’s refund API */
const cancelOrder = (orderId, payload, actor) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    assertAdmin(actor);
    const ord = yield ensureOrder(orderId);
    if (ord.status === "paid") {
        // Decide your policy. Typically:
        // 1) Initiate provider refund (Stripe/PayPal) — not implemented here
        // 2) If restock true and ecommerce, add stock back
        if (payload.restock && ord.source === "ecommerce" && ((_b = (_a = ord.ecommerce) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.length)) {
            for (const it of ord.ecommerce.items) {
                const prod = yield product_model_1.Product.findById(it.product);
                if (!prod)
                    continue;
                if (it.variantId && Array.isArray(prod.variants)) {
                    const idx = prod.variants.findIndex((v) => String(v._id) === String(it.variantId));
                    if (idx >= 0)
                        prod.variants[idx].stock = (prod.variants[idx].stock || 0) + it.qty;
                }
                else {
                    prod.stock = (prod.stock || 0) + it.qty;
                }
                yield prod.save();
            }
        }
    }
    ord.status = "cancelled";
    // Optionally record reason somewhere (add a cancellations array if you want audits)
    yield ord.save();
    return ord;
});
const resolvePrice = (course, couponCode) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // TODO: add coupon/discount logic here
    return { price: (_a = course.price) !== null && _a !== void 0 ? _a : 0, currency: (_b = course.currency) !== null && _b !== void 0 ? _b : "USD" };
});
/* ----------------------- NORMAL COURSE CHECKOUT ----------------------- */
const createCheckout = (courseId, userId, provider, itemType, couponCode, billingInfo) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const course = yield course_model_1.Course.findById(courseId);
    if (!course || course.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Course Not Found");
    const { price, currency } = yield resolvePrice(course, couponCode);
    // Handle free courses - auto-complete order and enroll
    if (price === 0) {
        const order = yield order_model_1.Order.create({
            user: userId,
            course: courseId,
            price,
            currency,
            provider: `"free"_${Math.random() * 100 * 100}`, // Special provider for free courses
            itemType,
            status: "paid", // Mark as completed immediately
            couponCode,
            billingInfo
        });
        // Auto-enroll the user in the free course
        const { EnrollmentServices } = yield Promise.resolve().then(() => __importStar(require('../enrollment/enrollment.services')));
        yield EnrollmentServices.enrollSelf(courseId, userId, (_a = course === null || course === void 0 ? void 0 : course.instructor) === null || _a === void 0 ? void 0 : _a.toString());
        // Award enrollment points for free course
        const { GamificationServices } = yield Promise.resolve().then(() => __importStar(require('../gamification/gamification.service')));
        yield GamificationServices.addPoints({
            userId,
            points: 20,
            sourceType: "enrollment",
            courseId: courseId,
            reason: "Free course enrollment",
        });
        const res = yield course_model_1.Course.findByIdAndUpdate(courseId, {
            $inc: { noOfStudents: 1 },
        }, { new: true });
        return {
            orderId: String(order._id),
            checkoutUrl: null, // No payment URL needed for free courses
            isFree: true,
            message: "Enrolled successfully in free course!"
        };
    }
    // Handle paid courses - create payment session
    const order = yield order_model_1.Order.create({
        user: userId,
        course: courseId,
        price,
        currency,
        provider,
        itemType,
        status: "pending",
        couponCode,
        billingInfo
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider,
        orderId: String(order._id),
        amount: price * 100,
        currency,
        courseId: String(course._id),
        userId: String(userId),
        source: itemType,
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
const createDonationCheckout = (fund, userId, provider, amount) => __awaiter(void 0, void 0, void 0, function* () {
    // Handle paid courses - create payment session
    const order = yield order_model_1.Order.create({
        user: userId,
        fund: fund,
        price: amount,
        currency: "USD",
        provider,
        itemType: "Donation",
        status: "pending",
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider,
        orderId: String(order._id),
        amount: amount,
        currency: 'USD',
        userId: String(userId),
        source: "event"
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
/* ----------------------- PACKAGE CHECKOUT ----------------------- */
const createCheckoutForPackage = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.create({
        user: input.userId,
        package: { id: input.packageId, name: input.name },
        courseIds: input.courseIds,
        price: input.amount,
        currency: input.currency,
        provider: "stripe",
        status: "pending",
        itemType: "package",
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider: "stripe",
        orderId: String(order._id),
        amount: input.amount * 100,
        currency: input.currency,
        packageId: input.packageId,
        userId: input.userId,
        source: "package",
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
const startEcommerceCheckoutFromClient = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const items = (_b = (_a = input === null || input === void 0 ? void 0 : input.payload) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : [];
    if (!items.length)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No items found to checkout");
    const verifiedLines = [];
    for (const line of items) {
        const prod = yield product_model_1.Product.findById(line.product);
        if (!prod || !prod.isActive)
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Product not available");
        let effectivePrice = prod.price;
        let effectiveStock = prod.stock;
        if (effectiveStock < line.qty) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient stock");
        }
        if (line.price !== effectivePrice) {
            // Protect from tampered FE prices
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Price mismatch. Refresh page.");
        }
        verifiedLines.push({
            product: prod._id,
            qty: line.quantity,
            unitPrice: effectivePrice,
            title: line.title || prod.title,
            image: line.image || ((_c = prod.images) === null || _c === void 0 ? void 0 : _c[0]),
        });
    }
    const subtotal = verifiedLines.reduce((s, it) => s + it.unitPrice * it.qty, 0);
    const discount = 0;
    const shippingFee = 0;
    const tax = .1;
    const total = subtotal - discount + shippingFee + (subtotal - discount + shippingFee) * tax;
    const order = yield order_model_1.Order.create({
        user: input.userId,
        provider: (_d = input === null || input === void 0 ? void 0 : input.payload) === null || _d === void 0 ? void 0 : _d.provider,
        status: "pending",
        source: "ecommerce",
        price: total,
        itemType: "ecommerce",
        currency: input.currency || "USD",
        ecommerce: {
            items: verifiedLines,
            subtotal,
            discount,
            shippingFee,
            tax,
            total,
            shippingAddress: (_e = input === null || input === void 0 ? void 0 : input.payload) === null || _e === void 0 ? void 0 : _e.shippingAddress,
            fulfillment: { status: "unfulfilled" },
        },
    });
    const { sessionId, checkoutUrl } = yield payment_services_1.PaymentService.createCheckoutSession({
        provider: (_f = input === null || input === void 0 ? void 0 : input.payload) === null || _f === void 0 ? void 0 : _f.provider,
        source: "ecommerce",
        orderId: String(order._id),
        amount: total * 100,
        currency: input.currency || "USD",
        userId: input.userId,
    });
    order.providerSessionId = sessionId;
    yield order.save();
    return { sessionId, checkoutUrl };
});
/* ----------------------- ORDERS FETCHING ----------------------- */
const getMyOrders = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.Order.find({ user: userId, isDeleted: false }).sort({ createdAt: -1 });
    return orders;
});
const getOrderById = (orderId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const ord = yield order_model_1.Order.findById(orderId);
    if (!ord)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Order Not Found");
    const isOwner = String(ord.user) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!(isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return ord;
});
const getOrderBySessionId = (sessionId, actor) => __awaiter(void 0, void 0, void 0, function* () {
    const ord = yield order_model_1.Order.findOne({ providerSessionId: sessionId });
    if (!ord)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Order Not Found");
    const isOwner = String(ord.user) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
    if (!(isOwner || isAdmin))
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    return ord;
});
const getOrders = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    var _a;
    const { q, page = 1, limit = 10 } = query;
    // Build aggregation pipeline
    const pipeline = [
        {
            $match: { isDeleted: false }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userData"
            },
        },
        {
            $unwind: {
                path: "$userData",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "events",
                localField: "event",
                foreignField: "_id",
                as: "eventData"
            }
        },
        {
            $unwind: {
                path: "$eventData",
                preserveNullAndEmptyArrays: true
            }
        },
    ];
    // Add search filter if query exists
    if (q) {
        pipeline.push({
            $match: {
                $or: [
                    { providerPaymentId: { $regex: q, $options: 'i' } },
                    { "userData.name": { $regex: q, $options: 'i' } },
                    { "userData.email": { $regex: q, $options: 'i' } }
                ]
            }
        });
    }
    // Add projection and pagination stages
    pipeline.push({
        $project: {
            transactionId: {
                $cond: {
                    if: { $and: [{ $ne: ["$providerPaymentId", null] }, { $ne: ["$providerPaymentId", ""] }] },
                    then: "$providerPaymentId",
                    else: { $toString: "$_id" }
                }
            },
            userName: "$userData.name",
            userEmail: "$userData.email",
            amount: "$price",
            currency: "$currency",
            date: "$createdAt",
            status: "$status",
            itemType: "$itemType",
            provider: "$provider",
            course: 1,
            ecommerce: 1,
            createdAt: 1,
            fund: 1,
            event: "$eventData.title"
        }
    }, {
        $sort: { createdAt: -1 }
    }, {
        $skip: (page - 1) * limit
    }, {
        $limit: limit * 1
    });
    // Clone pipeline for count (remove pagination stages)
    const countPipeline = [...pipeline];
    countPipeline.splice(-3, 3); // Remove sort, skip, limit stages
    // Execute queries
    const [orders, countResult] = yield Promise.all([
        order_model_1.Order.aggregate(pipeline),
        order_model_1.Order.aggregate([...countPipeline, { $count: "total" }])
    ]);
    const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    // Format the data
    const formattedOrders = orders.map(order => (Object.assign(Object.assign({}, order), { amountFormatted: `${order.amount.toFixed(2)} ${order.currency.toUpperCase()}`, dateFormatted: new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) })));
    return {
        orders: formattedOrders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
    };
});
const createCheckoutForEvent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.Order.create({
        user: input.userId,
        event: input.eventId,
        price: input.amount,
        currency: input.currency,
        provider: "stripe",
        status: "pending",
        itemType: "event",
    });
    const session = yield payment_services_1.PaymentService.createCheckoutSession({
        provider: "stripe",
        orderId: String(order._id),
        amount: input.amount * 100,
        currency: input.currency,
        eventId: input.eventId,
        userId: input.userId,
        source: "event",
    });
    order.providerSessionId = session.sessionId;
    yield order.save();
    return { orderId: String(order._id), checkoutUrl: session.checkoutUrl };
});
/* ----------------------- EXPORT ----------------------- */
exports.OrderServices = {
    createCheckout,
    createCheckoutForPackage,
    startEcommerceCheckoutFromClient,
    getMyOrders,
    getOrderById,
    getOrderBySessionId,
    getOrders,
    fulfillEcommerceOrder,
    updateEcommerceTracking,
    markEcommerceDelivered,
    cancelOrder,
    createDonationCheckout,
    createCheckoutForEvent
};
