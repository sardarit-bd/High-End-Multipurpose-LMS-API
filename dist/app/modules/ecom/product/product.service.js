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
exports.ProductServices = { createProduct, listProducts, getProduct, updateProduct };
