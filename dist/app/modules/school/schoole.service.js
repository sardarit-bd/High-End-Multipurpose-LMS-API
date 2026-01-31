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
exports.SchoolServices = void 0;
// app/modules/school/school.service.ts
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const school_model_1 = __importDefault(require("./school.model"));
const create = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.default.create(payload);
    return yield school.populate('city', 'name country');
});
const update = (schoolId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.default.findByIdAndUpdate(schoolId, payload, { new: true }).populate('city', 'name country');
    if (!school)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "School not found");
    return school;
});
const remove = (schoolId) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.default.findByIdAndDelete(schoolId);
    if (!school)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "School not found");
    return school;
});
const listAll = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q = "", page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", cityId, isActive } = query, otherFilters = __rest(query, ["q", "page", "limit", "sortBy", "sortOrder", "cityId", "isActive"]);
    // Build search query
    const searchQuery = {};
    // Search in name and code
    if (q && q.trim()) {
        searchQuery.$or = [
            { name: { $regex: q.trim(), $options: "i" } },
            { code: { $regex: q.trim(), $options: "i" } },
            { address: { $regex: q.trim(), $options: "i" } },
        ];
    }
    // Filter by city
    if (cityId && cityId.trim()) {
        searchQuery.city = cityId;
    }
    // Filter by isActive status if provided
    if (isActive !== undefined && isActive !== "") {
        searchQuery.isActive = isActive === "true" || isActive === true;
    }
    // Apply other filters
    Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key] !== undefined && otherFilters[key] !== "") {
            searchQuery[key] = otherFilters[key];
        }
    });
    // Convert page and limit to numbers
    const pageNumber = parseInt(String(page), 10) || 1;
    const limitNumber = parseInt(String(limit), 10) || 10;
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.max(1, Math.min(limitNumber, 100));
    // Calculate pagination
    const skip = (validPage - 1) * validLimit;
    // Get total count
    const total = yield school_model_1.default.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / validLimit);
    // Validate page number
    if (validPage > totalPages && total > 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Page number exceeds total pages");
    }
    // Determine sort order
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortDirection;
    // Fetch schools with pagination and sorting
    const schools = yield school_model_1.default.find(searchQuery)
        .populate('city', 'name country')
        .sort(sortOptions)
        .skip(skip)
        .limit(validLimit)
        .lean();
    return {
        data: schools,
        meta: {
            page: validPage,
            limit: validLimit,
            total,
            totalPages,
        },
    };
});
const getById = (schoolId) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.default.findById(schoolId).populate('city', 'name country');
    if (!school)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "School not found");
    return school;
});
const toggleStatus = (schoolId) => __awaiter(void 0, void 0, void 0, function* () {
    const school = yield school_model_1.default.findById(schoolId);
    if (!school)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "School not found");
    school.isActive = !school.isActive;
    yield school.save();
    yield school.populate('city', 'name country');
    return school;
});
exports.SchoolServices = {
    create,
    update,
    remove,
    listAll,
    getById,
    toggleStatus,
};
