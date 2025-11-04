import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { Instructor, User } from "./user.model";
import httpStatus from 'http-status-codes'
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
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

const getInstructor = async (userId: string) => {
  const instructor = await Instructor.findOne({userId}).populate('userId', 'name email picture intro')

  if (!instructor) {
    throw new AppError(httpStatus.NOT_FOUND, "Instructor Not Found");
  }

  return instructor;
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


export const UserServices = {
    getMe,
    createUser,
    requestInstructor,
    approveInstructor,
    getInstructor
};