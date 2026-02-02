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
exports.ProductServices = void 0;
const product_model_1 = require("./product.model");
const AppError_1 = __importDefault(require("../../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const order_model_1 = require("../../order/order.model");
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield product_model_1.Product.findOne({ slug: payload.slug });
    if (exist)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Product slug already exists");
    return product_model_1.Product.create(payload);
});
const updateProduct = (slug, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield product_model_1.Product.findOne({ slug: slug });
    if (!exist)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Product does not exists");
    return product_model_1.Product.findOneAndUpdate({ slug: slug }, payload);
});
const listProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {};
    if (query.category)
        filter.category = query.category;
    if (query.q)
        filter["title"] = new RegExp(query.q, "i");
    const sort = {};
    if (query.sort === "price")
        sort.price = 1;
    else if (query.sort === "-price")
        sort.price = -1;
    else
        sort.createdAt = -1;
    return product_model_1.Product.find(filter).sort(sort).limit(Number(query.limit) || 50).populate("category");
});
const getProduct = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.Product.findOne({ slug });
    if (!product)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Product not found");
    return product;
});
const getPurchasedProducts = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find all paid ecommerce orders for this user
    const orders = yield order_model_1.Order.find({
        user: userId,
        status: "paid",
        itemType: "ecommerce",
        "ecommerce.items.0": { $exists: true }
    }).populate({
        path: "ecommerce.items.product",
        model: product_model_1.Product,
        select: "title slug description images type price featuredImage digitalUrl isActive"
    });
    // Extract products from orders
    const purchasedProducts = [];
    const productMap = new Map();
    orders.forEach(order => {
        var _a;
        if ((_a = order.ecommerce) === null || _a === void 0 ? void 0 : _a.items) {
            order.ecommerce.items.forEach((item) => {
                var _a, _b;
                const productId = item.product._id.toString();
                // Skip if product already added
                if (productMap.has(productId))
                    return;
                const product = item.product;
                purchasedProducts.push({
                    _id: product._id,
                    title: product.title,
                    slug: product.slug,
                    description: product.description,
                    images: product.images,
                    type: product.type,
                    price: product.price,
                    featuredImage: product.featuredImage,
                    digitalUrl: product.digitalUrl,
                    isActive: product.isActive,
                    purchaseInfo: {
                        orderId: order._id,
                        purchasedAt: order.createdAt,
                        quantity: item.qty,
                        unitPrice: item.unitPrice,
                        totalPrice: item.qty * item.unitPrice,
                        fulfillmentStatus: ((_b = (_a = order.ecommerce) === null || _a === void 0 ? void 0 : _a.fulfillment) === null || _b === void 0 ? void 0 : _b.status) || "unfulfilled"
                    },
                    canDownload: product.type === "digital" && product.digitalUrl,
                    downloadUrl: product.type === "digital" ? product.digitalUrl : null
                });
                productMap.set(productId, true);
            });
        }
    });
    return purchasedProducts;
});
exports.ProductServices = { createProduct, listProducts, getProduct, updateProduct, getPurchasedProducts };
