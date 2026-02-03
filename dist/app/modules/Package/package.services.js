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
exports.PackageServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const package_model_1 = require("./package.model");
const course_model_1 = require("../course/course.model");
const order_services_1 = require("../order/order.services");
const assertCourses = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield course_model_1.Course.countDocuments({ _id: { $in: ids }, isDeleted: { $ne: true } });
    if (count !== ids.length)
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Some courses not found or deleted");
});
const packageCreate = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield assertCourses(payload.courseIds);
    return package_model_1.Package.create(payload);
});
const packageUpdate = (packageId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload === null || payload === void 0 ? void 0 : payload.courseIds)
        yield assertCourses(payload.courseIds);
    const pkg = yield package_model_1.Package.findByIdAndUpdate(packageId, payload, { new: true });
    if (!pkg)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    return pkg;
});
const packageSoftDelete = (packageId) => __awaiter(void 0, void 0, void 0, function* () {
    const pkg = yield package_model_1.Package.findByIdAndUpdate(packageId, { isDeleted: true, isActive: false }, { new: true });
    if (!pkg)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    return pkg;
});
const packageGet = (packageId) => __awaiter(void 0, void 0, void 0, function* () {
    const pkg = yield package_model_1.Package.findOne({ _id: packageId, isDeleted: { $ne: true } }).populate("courseIds", "title price currency");
    if (!pkg)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    return pkg;
});
const packageListPublic = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield package_model_1.Package.find({
        isDeleted: { $ne: true },
    })
        .populate({
        path: 'courseIds',
        select: 'title price category thumbnail level noOfStudents',
        match: {
            isDeleted: { $ne: true },
        }
    })
        .sort({ createdAt: -1 });
});
/** Reuse order system to create a checkout for a package */
const createCheckout = (packageId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pkg = yield package_model_1.Package.findOne({ _id: packageId, isDeleted: { $ne: true }, isActive: true });
    if (!pkg)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Package not found");
    const amount = pkg.price;
    // Reuse OrderServices but for itemType "package"
    return order_services_1.OrderServices.createCheckoutForPackage({
        packageId: String(pkg._id),
        userId,
        amount,
        currency: pkg.currency,
        courseIds: pkg.courseIds.map(String),
        name: pkg.name
    });
});
exports.PackageServices = { packageCreate, packageUpdate, packageGet, packageListPublic, packageSoftDelete, createCheckout };
