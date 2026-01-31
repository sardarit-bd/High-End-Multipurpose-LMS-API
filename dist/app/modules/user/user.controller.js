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
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "User profile fetched successfully",
        data: user,
    });
}));
const getStudentProfile = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const student = yield user_services_1.UserServices.getStudentProfile(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Student profile fetched successfully",
        data: student,
    });
}));
const updateMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedToken = req.user;
    const user = yield user_services_1.UserServices.updateMe(verifiedToken.userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Profile updated successfully",
        data: user,
    });
}));
const getInstructor = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_services_1.UserServices.getInstructor(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Instructor is fetched Successfully",
        data: user,
    });
}));
const getAllInstructors = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const instructors = yield user_services_1.UserServices.getAllInstructors(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Instructors fetched Successfully",
        data: instructors,
    });
}));
const getUniqueExpertise = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const instructors = yield user_services_1.UserServices.getUniqueExpertise();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Unique Experties fetched Successfully",
        data: instructors,
    });
}));
const getAllStudents = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const instructors = yield user_services_1.UserServices.getAllStudents(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Students fetched Successfully",
        data: instructors,
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
const updateInstructor = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const updated = yield user_services_1.UserServices.updateInstructor(req.params.id, req.body, {
        userId: token.userId,
        role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Profile Updated Successfully",
        data: updated,
    });
}));
const getAllAdmins = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const result = yield user_services_1.UserServices.getAllAdmins(req.query, {
        userId: token.userId,
        role: token.role
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Admins fetched successfully",
        data: result
    });
}));
const createAdmin = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const result = yield user_services_1.UserServices.createAdmin(req.body, {
        userId: token.userId,
        role: token.role
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Admin created successfully",
        data: result
    });
}));
const deleteAdmin = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const result = yield user_services_1.UserServices.deleteAdmin(req.params.id, {
        userId: token.userId,
        role: token.role
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Admin deleted successfully",
        data: result
    });
}));
exports.userController = {
    createUser,
    getMe,
    updateMe,
    requestInstructor,
    approveInstructor,
    getInstructor,
    getAllInstructors,
    updateInstructor,
    getAllStudents,
    getAllAdmins,
    createAdmin,
    deleteAdmin,
    getUniqueExpertise,
    getStudentProfile
};
