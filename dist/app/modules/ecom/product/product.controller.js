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
exports.ProductController = void 0;
const catchAsync_1 = require("../../../utils/catchAsync");
const sendResponse_1 = require("../../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const product_service_1 = require("./product.service");
const createProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield product_service_1.ProductServices.createProduct(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.CREATED, success: true, message: "Product created", data });
}));
const updateProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const data = yield product_service_1.ProductServices.updateProduct(slug, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.CREATED, success: true, message: "Product updated", data });
}));
const listProducts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield product_service_1.ProductServices.listProducts(req.query);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Product list", data });
}));
const getProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield product_service_1.ProductServices.getProduct(req.params.slug);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Product detail", data });
}));
const getPurchasedProducts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const data = yield product_service_1.ProductServices.getPurchasedProducts(user === null || user === void 0 ? void 0 : user.userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Product detail", data });
}));
exports.ProductController = { createProduct, listProducts, getProduct, updateProduct, getPurchasedProducts };
