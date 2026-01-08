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
exports.checkEnrollment = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const enrollment_model_1 = require("../modules/enrollment/enrollment.model");
const checkEnrollment = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.user;
    const { courseId } = req.params;
    const doc = yield enrollment_model_1.Enrollment.findOne({ course: courseId, user: token.userId, isDeleted: false });
    if (!doc)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Please enroll (or complete payment) to access this content");
    return next();
});
exports.checkEnrollment = checkEnrollment;
