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
exports.orderController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const order_services_1 = require("./order.services");
/**
 * 🧾 Create checkout for normal course/package/event
 */
const createCheckout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { provider, couponCode, courseId, itemType, billingInfo } = req.body;
    const data = yield order_services_1.OrderServices.createCheckout(courseId, token.userId, provider, itemType, couponCode, billingInfo);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Checkout created successfully",
        data,
    });
}));
const createDonationCheckout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { provider, fund, amount, } = req.body;
    const data = yield order_services_1.OrderServices.createDonationCheckout(fund, token === null || token === void 0 ? void 0 : token.userId, provider, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Checkout created successfully",
        data,
    });
}));
/**
 * 🛒 Checkout for eCommerce (client-provided cart)
 * - Body: { items: [...], shippingAddress: {...}, currency?: "USD" }
 */
const checkoutEcommerce = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const session = yield order_services_1.OrderServices.startEcommerceCheckoutFromClient({
        userId: token.userId,
        payload: req.body
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "E-commerce checkout session created successfully",
        data: session, // { orderId, sessionId, checkoutUrl }
    });
}));
/**
 * 📦 Get my orders (student/instructor)
 */
const getMyOrders = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const orders = yield order_services_1.OrderServices.getMyOrders(token.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "My orders fetched successfully",
        data: orders,
    });
}));
/**
 * 📄 Get order details by orderId
 */
const getOrderById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { orderId } = req.params;
    const doc = yield order_services_1.OrderServices.getOrderById(orderId, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Order details retrieved successfully",
        data: doc,
    });
}));
/**
 * 🔍 Get order details by Stripe/Toyyib sessionId
 */
const getOrderBySession = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { sessionId } = req.params;
    const doc = yield order_services_1.OrderServices.getOrderBySessionId(sessionId, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Order details retrieved successfully",
        data: doc,
    });
}));
/**
 * 🧾 Admin: Get all orders (global list)
 */
const getOrders = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_services_1.OrderServices.getOrders(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All orders retrieved successfully",
        data: orders,
    });
}));
const fulfillEcommerce = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { id } = req.params;
    const result = yield order_services_1.OrderServices.fulfillEcommerceOrder(id, req.body, // { status, trackingNumber?, carrier? }
    { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Order fulfillment updated",
        data: result,
    });
}));
const updateTracking = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { id } = req.params;
    const result = yield order_services_1.OrderServices.updateEcommerceTracking(id, req.body, // { trackingNumber, carrier?, status? }
    { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Tracking updated",
        data: result,
    });
}));
const markDelivered = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { id } = req.params;
    const result = yield order_services_1.OrderServices.markEcommerceDelivered(id, req.body, // { deliveredAt? }
    { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Order marked delivered",
        data: result,
    });
}));
const cancelOrder = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { id } = req.params;
    const result = yield order_services_1.OrderServices.cancelOrder(id, req.body, // { reason?, restock? }
    { userId: token.userId, role: token.role });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Order cancelled",
        data: result,
    });
}));
exports.orderController = {
    createCheckout,
    checkoutEcommerce,
    getMyOrders,
    getOrderById,
    getOrderBySession,
    getOrders,
    fulfillEcommerce,
    updateTracking,
    markDelivered,
    cancelOrder,
    createDonationCheckout
};
