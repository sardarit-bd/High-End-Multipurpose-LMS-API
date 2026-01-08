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
exports.packageController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const package_services_1 = require("./package.services");
const packageCreate = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield package_services_1.PackageServices.packageCreate(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.CREATED, success: true, message: "Package created", data });
}));
const packageUpdate = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield package_services_1.PackageServices.packageUpdate(req.params.packageId, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Package updated", data });
}));
const remove = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield package_services_1.PackageServices.packageSoftDelete(req.params.packageId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Package deleted", data });
}));
const get = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield package_services_1.PackageServices.packageGet(req.params.packageId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Package details", data });
}));
const listPublic = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield package_services_1.PackageServices.packageListPublic();
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.OK, success: true, message: "Packages", data });
}));
const createCheckout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const data = yield package_services_1.PackageServices.createCheckout(req.body.packageId, token.userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: http_status_codes_1.default.CREATED, success: true, message: "Checkout created", data });
}));
exports.packageController = { packageCreate, createCheckout, packageUpdate, remove, get, listPublic };
