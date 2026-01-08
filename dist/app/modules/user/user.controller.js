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
exports.userController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_services_1 = require("./user.services");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Request body in controller:", req.body);
    const user = yield user_services_1.UserServices.createUser(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "User Created Successfully",
        data: user,
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedToken = req.user;
    const user = (yield user_services_1.UserServices.getMe(verifiedToken.userId));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "User Updated Successfully",
        data: user,
    });
}));
const getInstructor = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(req.params);
    const user = yield user_services_1.UserServices.getInstructor(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Instructor is fetched Successfully",
        data: user,
    });
}));
const requestInstructor = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = req.user;
    const user = yield user_services_1.UserServices.requestInstructor(token.userId, (_a = req.body) === null || _a === void 0 ? void 0 : _a.note);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Instructor request submitted",
        data: user,
    });
}));
const approveInstructor = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const token = req.user;
    const { userId } = req.body;
    const user = yield user_services_1.UserServices.approveInstructor(userId, { userId: token.userId, role: token.role }, {
        action: (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.action) !== null && _b !== void 0 ? _b : "approve",
        note: (_c = req.body) === null || _c === void 0 ? void 0 : _c.note,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: ((_d = req.body) === null || _d === void 0 ? void 0 : _d.action) === "reject" ? "Request rejected" : "User promoted to instructor",
        data: user,
    });
}));
exports.userController = {
    createUser,
    getMe,
    requestInstructor,
    approveInstructor,
    getInstructor
};
