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
exports.unitController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const unit_services_1 = require("./unit.services");
const createUnit = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user; // expects { userId, role }
    const created = yield unit_services_1.UnitServices.createUnit(req.body, {
        userId: token.userId, role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Unit Created Successfully",
        data: created,
    });
}));
const listUnits = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const items = yield unit_services_1.UnitServices.listUnits(courseId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Units fetched",
        data: items,
    });
}));
const updateUnit = (0, catchAsync_1.catchAsync)((req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { unitId } = req.params;
    const updated = yield unit_services_1.UnitServices.updateUnit(unitId, req.body, {
        userId: token.userId, role: token.role,
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Unit Updated Successfully",
        data: updated,
    });
}));
exports.unitController = { createUnit, listUnits, updateUnit };
