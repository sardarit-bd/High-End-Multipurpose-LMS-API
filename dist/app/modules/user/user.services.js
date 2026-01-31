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
const getStudentProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const student = yield user_model_1.User.findById(userId)
        .populate('city', 'name country')
        .populate('school', 'name code address')
        .select("-password -auths");
    if (!student || student.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Student not found");
    }
    if (student.role !== user_interface_1.Role.STUDENT) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not a student");
    }
    return student;
});
const updateMe = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    console.log("payload", payload);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    // For student role, allow additional fields
    const allowedFields = ['name', 'phone', 'organization', 'region', 'intro', 'address', 'picture', 'gender', 'dob'];
    // Add student-specific fields if user is a student
    if (user.role === user_interface_1.Role.STUDENT) {
        allowedFields.push('dateOfBirth', 'gender', 'city', 'school', 'grade', 'interests', 'goals');
        allowedFields.push('socialLinks');
    }
    const updates = {};
    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            updates[field] = payload[field];
        }
    }
    // Handle socialLinks update
    if (payload.socialLinks) {
        updates.socialLinks = Object.assign(Object.assign({}, user.socialLinks), payload.socialLinks);
    }
    console.log(updates);
    if (!updates.city) {
        delete updates.city;
        // Or set to null: updateData.city = null;
    }
    if (!updates.school) {
        delete updates.school;
        // Or set to null: updateData.school = null;
    }
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, updates, { new: true })
        .select("-password -auths")
        .populate('city', 'name country')
        .populate('school', 'name code address');
    return updatedUser;
});
const getInstructor = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Try to find instructor by userId first, then by instructor document _id if not found
    let instructor = yield user_model_1.Instructor.findOne({ userId: id }).populate('userId', 'name email picture intro phone socialLinks createdAt isVerified');
    // If not found by userId, try finding by instructor document _id
    if (!instructor) {
        instructor = yield user_model_1.Instructor.findById(id).populate('userId', 'name email picture intro phone socialLinks createdAt isVerified');
    }
    if (!instructor) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Instructor Not Found");
    }
    return instructor;
});
const getAllInstructors = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q, page = 1, limit = 10 } = query;
    // First, find matching users if search query is provided
    let userIds = [];
    if (q) {
        const matchingUsers = yield user_model_1.User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('_id');
        userIds = matchingUsers.map(user => user._id);
    }
    // Build filter for instructors
    const filter = {};
    // If search query provided
    if (q) {
        filter.$or = [
            { designation: { $regex: q, $options: 'i' } }
        ];
        // Only add userId search if we found matching users
        if (userIds.length > 0) {
            filter.$or.push({ userId: { $in: userIds } });
        }
    }
    // Handle expertise filter
    if (query.expertise) {
        // Split comma-separated string into array
        const expertiseArray = query.expertise.split(',').map((exp) => exp.trim());
        // Use $in to match any of the expertise values
        filter.expertise = { $in: expertiseArray };
    }
    console.log(filter);
    const instructors = yield user_model_1.Instructor.find(filter)
        .populate('userId', 'name email picture intro phone socialLinks createdAt isVerified instructorRequest')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    const total = yield user_model_1.Instructor.countDocuments(filter);
    return {
        instructors,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
    };
});
const getAllStudents = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { q, page = 1, limit = 10 } = query;
    // Build filter for students (users with role "student")
    const filter = {
        role: user_interface_1.Role.STUDENT,
        isDeleted: false
    };
    // If search query provided, search in name or email
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ];
    }
    const students = yield user_model_1.User.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "enrollments",
                localField: "_id",
                foreignField: "user",
                as: "enrollments"
            }
        },
        {
            $lookup: {
                from: "pointwallets",
                localField: "_id",
                foreignField: "user",
                as: "pointWallet"
            }
        },
        {
            $lookup: {
                from: "cities",
                localField: "city",
                foreignField: "_id",
                as: "cityInfo"
            }
        },
        {
            $lookup: {
                from: "schools",
                localField: "school",
                foreignField: "_id",
                as: "schoolInfo"
            }
        },
        {
            $addFields: {
                totalEnrolledCourses: { $size: "$enrollments" },
                points: { $ifNull: [{ $arrayElemAt: ["$pointWallet.totalPoints", 0] }, 0] },
                city: { $arrayElemAt: ["$cityInfo", 0] },
                school: { $arrayElemAt: ["$schoolInfo", 0] },
                joinedDate: "$createdAt"
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                picture: 1,
                phone: 1,
                gender: 1,
                grade: 1,
                interests: 1,
                dateOfBirth: 1,
                totalEnrolledCourses: 1,
                points: 1,
                joinedDate: 1,
                createdAt: 1,
                city: {
                    _id: 1,
                    name: 1,
                    country: 1
                },
                school: {
                    _id: 1,
                    name: 1,
                    code: 1,
                    address: 1
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit * 1
        }
    ]);
    const total = yield user_model_1.User.countDocuments(filter);
    return {
        students,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
    };
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
const updateInstructor = (id, updates, actor) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(updates);
    const instructor = yield user_model_1.Instructor.findOne({ userId: id });
    const user = yield user_model_1.User.findById(id);
    if (!instructor || !user)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Instructor Not Found");
    const isOwner = String(instructor.userId) === String(actor.userId);
    const isAdmin = actor.role === "ADMIN";
    if (!isOwner && !isAdmin)
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    Object.assign(instructor, updates);
    yield instructor.save();
    Object.assign(user, updates);
    yield user.save();
    return instructor;
});
const getAllAdmins = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}, actor) {
    // Check if actor is SUPER_ADMIN
    if (actor.role !== "SUPER_ADMIN") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    }
    const { q, page = 1, limit = 10 } = query;
    const filter = {
        role: { $in: ['SUPER_ADMIN', 'ADMIN'] },
        isDeleted: false
    };
    if (q) {
        filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
        ];
    }
    const admins = yield user_model_1.User.find(filter)
        .select('-password -auths -__v')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    const total = yield user_model_1.User.countDocuments(filter);
    return {
        admins,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
    };
});
const createAdmin = (data, actor) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if actor is SUPER_ADMIN
    if (actor.role !== "SUPER_ADMIN") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    }
    const { name, email, password, role } = data;
    // Check if user already exists
    const existingUser = yield user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User with this email already exists");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    // Create new admin user
    const newAdmin = new user_model_1.User({
        name,
        email,
        password: hashedPassword,
        role: role || 'ADMIN',
        isVerified: true
    });
    yield newAdmin.save();
    // Remove password from response
    const adminData = newAdmin.toObject();
    delete adminData.password;
    return adminData;
});
const deleteAdmin = (id, actor) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if actor is SUPER_ADMIN
    if (actor.role !== "SUPER_ADMIN") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Forbidden");
    }
    // Prevent deleting yourself
    if (actor.userId === id) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot delete your own account");
    }
    const admin = yield user_model_1.User.findById(id);
    if (!admin) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Admin not found");
    }
    // Check if trying to delete another SUPER_ADMIN (only SUPER_ADMIN can delete SUPER_ADMIN)
    if (admin.role === "SUPER_ADMIN") {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Cannot delete another Super Admin");
    }
    admin.isDeleted = true;
    yield admin.save();
    // Remove password from response
    const adminData = admin.toObject();
    delete adminData.password;
    return adminData;
});
const getUniqueExpertise = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    var _a;
    const { q, page = 1, limit = 20 } = query;
    // Build aggregation pipeline
    const pipeline = [];
    if (q) {
        pipeline.push({ $match: { expertise: { $regex: q, $options: 'i' } } });
    }
    pipeline.push({ $unwind: "$expertise" }, {
        $group: {
            _id: "$expertise",
            count: { $sum: 1 }
        }
    }, { $match: { _id: { $ne: null } } }, { $sort: { count: -1, _id: 1 } });
    // Get total count first
    const totalResult = yield user_model_1.Instructor.aggregate([
        ...pipeline,
        { $count: "total" }
    ]);
    const total = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    // Add pagination and get results
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit * 1 });
    const expertise = yield user_model_1.Instructor.aggregate(pipeline);
    const transformedExpertise = expertise.map(item => ({
        _id: item._id,
        name: item._id,
        count: item.count
    }));
    return {
        expertise: transformedExpertise,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
    };
});
exports.UserServices = {
    getMe,
    updateMe,
    createUser,
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
