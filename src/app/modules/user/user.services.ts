import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IInstructor, IUser, Role } from "./user.interface";
import { Instructor, User } from "./user.model";
import httpStatus from 'http-status-codes'
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
  console.log("Payload in service:", payload);
    const { email, password, ...rest } = payload;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
    }
    const hashPassword = await bcryptjs.hash(
        password as string,
        Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
        provider: "credentials",
        providerId: email as string,
    };

    const user = await User.create({
        email,
        password: hashPassword,
        auths: [authProvider],
        ...rest,
    });

    if(user.role === Role.INSTRUCTOR){
      const inst = await Instructor.create({
        userId: user._id
      })
    }

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return user;
};

const updateMe = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  // Only allow updating certain fields
  const allowedFields = ['name', 'phone', 'organization', 'region', 'intro', 'address', 'picture', 'gender', 'dob'];
  const updates: Partial<IUser> = {};

  for (const field of allowedFields) {
    if ((payload as any)[field] !== undefined) {
      (updates as any)[field] = (payload as any)[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

  return updatedUser;
};

const getInstructor = async (id: string) => {
  // Try to find instructor by userId first, then by instructor document _id if not found
  let instructor = await Instructor.findOne({userId: id}).populate('userId', 'name email picture intro phone socialLinks createdAt isVerified')

  // If not found by userId, try finding by instructor document _id
  if (!instructor) {
    instructor = await Instructor.findById(id).populate('userId', 'name email picture intro phone socialLinks createdAt isVerified')
  }

  if (!instructor) {
    throw new AppError(httpStatus.NOT_FOUND, "Instructor Not Found");
  }

  return instructor;
};

const getAllInstructors = async (query: any = {}) => {
  const { q, page = 1, limit = 10 } = query;

  // Build filter for instructors
  const filter: any = {};

  // If search query provided, search in user name or instructor designation
  if (q) {
    filter.$or = [
      { 'userId.name': { $regex: q, $options: 'i' } },
      { designation: { $regex: q, $options: 'i' } },
      { 'userId.email': { $regex: q, $options: 'i' } }
    ];
  }

  const instructors = await Instructor.find(filter)
    .populate('userId', 'name email picture intro phone socialLinks createdAt isVerified')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Instructor.countDocuments(filter);

  return {
    instructors,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const requestInstructor = async (userId: string, note?: string) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (user.role === Role.INSTRUCTOR || user.role === Role.ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are already an instructor/admin");
  }

  const status = user.instructorRequest?.status ?? "none";
  if (status === "pending") {
    throw new AppError(httpStatus.BAD_REQUEST, "Request already pending");
  }

  user.instructorRequest = {
    status: "pending",
    note,
    requestedAt: new Date(),
  };
  await user.save();

  return user.toObject();
};

const approveInstructor = async (
  targetUserId: string,
  actor: { userId: string; role: string },
  payload: { action: "approve" | "reject"; note?: string }
) => {
  // Only ADMIN can approve/reject
  if (actor.role !== Role.ADMIN && actor.role !== Role.SUPER_ADMIN) throw new AppError(httpStatus.FORBIDDEN, "Only admin can approve");

  const user = await User.findById(targetUserId);
  if (!user || user.isDeleted) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const now = new Date();

  if (payload.action === "approve") {
    user.role = Role.INSTRUCTOR; 
    user.instructorRequest = {
      status: "approved",
      note: payload.note,
      requestedAt: user.instructorRequest?.requestedAt,
      reviewedAt: now,
      reviewedBy: actor.userId as any,
    };
  } else {
    user.instructorRequest = {
      status: "rejected",
      note: payload.note,
      requestedAt: user.instructorRequest?.requestedAt,
      reviewedAt: now,
      reviewedBy: actor.userId as any,
    };
  }

  await user.save();

  const obj = user.toObject();
  delete (obj as any).password;
  return obj;
};



const updateInstructor = async (
  id: string,
  updates: Partial<IInstructor & IUser>,
  actor: { userId: string; role: string }
) => {
  const instructor = await Instructor.findOne({userId: id});
  const user = await User.findById(id);
  if (!instructor || !user) throw new AppError(httpStatus.NOT_FOUND, "Instructor Not Found");

  const isOwner = String(instructor.userId) === String(actor.userId);
  const isAdmin = actor.role === "ADMIN";
  if (!isOwner && !isAdmin) throw new AppError(httpStatus.FORBIDDEN, "Forbidden");

  Object.assign(instructor, updates);
  await instructor.save();

  Object.assign(user, updates);
  await user.save();

  return instructor;
};

export const UserServices = {
    getMe,
    updateMe,
    createUser,
    requestInstructor,
    approveInstructor,
    getInstructor,
    getAllInstructors,
    updateInstructor
};