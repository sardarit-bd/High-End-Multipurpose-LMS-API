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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Payload in service:", payload);
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exist");
    }
    const hashPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = {
        provider: "credentials",
        providerId: email,
    };
    const user = yield user_model_1.User.create(Object.assign({ email, password: hashPassword, auths: [authProvider] }, rest));
    if (user.role === user_interface_1.Role.INSTRUCTOR) {
        const inst = yield user_model_1.Instructor.create({
            userId: user._id
        });
    }
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    return user;
});
const getInstructor = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const instructor = yield user_model_1.Instructor.findOne({ userId }).populate('userId', 'name email picture intro');
    if (!instructor) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Instructor Not Found");
    }
    return instructor;
});
const requestInstructor = (userId, note) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = yield user_model_1.User.findById(userId);
    if (!user || user.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    if (user.role === user_interface_1.Role.INSTRUCTOR || user.role === user_interface_1.Role.ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You are already an instructor/admin");
    }
    const status = (_b = (_a = user.instructorRequest) === null || _a === void 0 ? void 0 : _a.status) !== null && _b !== void 0 ? _b : "none";
    if (status === "pending") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Request already pending");
    }
    user.instructorRequest = {
        status: "pending",
        note,
        requestedAt: new Date(),
    };
    yield user.save();
    return user.toObject();
});
const approveInstructor = (targetUserId, actor, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Only ADMIN can approve/reject
    if (actor.role !== user_interface_1.Role.ADMIN && actor.role !== user_interface_1.Role.SUPER_ADMIN)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Only admin can approve");
    const user = yield user_model_1.User.findById(targetUserId);
    if (!user || user.isDeleted)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    const now = new Date();
    if (payload.action === "approve") {
        user.role = user_interface_1.Role.INSTRUCTOR;
        user.instructorRequest = {
            status: "approved",
            note: payload.note,
            requestedAt: (_a = user.instructorRequest) === null || _a === void 0 ? void 0 : _a.requestedAt,
            reviewedAt: now,
            reviewedBy: actor.userId,
        };
    }
    else {
        user.instructorRequest = {
            status: "rejected",
            note: payload.note,
            requestedAt: (_b = user.instructorRequest) === null || _b === void 0 ? void 0 : _b.requestedAt,
            reviewedAt: now,
            reviewedBy: actor.userId,
        };
    }
    yield user.save();
    const obj = user.toObject();
    delete obj.password;
    return obj;
});
exports.UserServices = {
    getMe,
    createUser,
    requestInstructor,
    approveInstructor,
    getInstructor
};
