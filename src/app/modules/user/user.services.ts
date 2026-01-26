import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IInstructor, IUser, Role } from "./user.interface";
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

  // First, find matching users if search query is provided
  let userIds:any = [];
  if (q) {
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('_id');
    
    userIds = matchingUsers.map(user => user._id);
  }

  // Build filter for instructors
  const filter: any = {};

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

  const instructors = await Instructor.find(filter)
    .populate('userId', 'name email picture intro phone socialLinks createdAt isVerified instructorRequest')
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

const getAllStudents = async (query: any = {}) => {
  const { q, page = 1, limit = 10 } = query;

  // Build filter for students (users with role "student")
  const filter: any = {
    role: Role.STUDENT,
    isDeleted: false
  };

  // If search query provided, search in name or email
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
  }

  const students = await User.aggregate([
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
      $addFields: {
        totalEnrolledCourses: { $size: "$enrollments" },
        points: { $ifNull: [{ $arrayElemAt: ["$pointWallet.totalPoints", 0] }, 0] },
        joinedDate: "$createdAt"
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        picture: 1,
        totalEnrolledCourses: 1,
        points: 1,
        joinedDate: 1,
        createdAt: 1
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

  const total = await User.countDocuments(filter);

  return {
    students,
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

const getAllAdmins = async (
  query: any = {},
  actor: { userId: string; role: string }
) => {
  // Check if actor is SUPER_ADMIN
  if (actor.role !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
  }

  const { q, page = 1, limit = 10 } = query;
 
  const filter: any = {
    role: { $in: ['SUPER_ADMIN', 'ADMIN'] },
    isDeleted: false
  };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
  }

  const admins = await User.find(filter)
    .select('-password -auths -__v')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  return {
    admins,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit)
  };
};

const createAdmin = async (
  data : Partial<IInstructor & IUser>,
  actor: { userId: string; role: string }
) => {
  // Check if actor is SUPER_ADMIN
  if (actor.role !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
  }

  const { name, email, password, role } = data;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User with this email already exists");
  }

  const hashedPassword = await bcryptjs.hash(
        password as string,
        Number(envVars.BCRYPT_SALT_ROUND)
    );
  // Create new admin user
  const newAdmin = new User({
    name,
    email,
    password: hashedPassword,
    role: role || 'ADMIN',
    isVerified: true
  });

  await newAdmin.save();

  // Remove password from response
  const adminData = newAdmin.toObject();
  delete adminData.password;

  return adminData;
};

const deleteAdmin = async (
  id: string,
  actor:  { userId: string; role: string }
) => {
  // Check if actor is SUPER_ADMIN
  if (actor.role !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
  }

  // Prevent deleting yourself
  if (actor.userId === id) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot delete your own account");
  }

  const admin = await User.findById(id);
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Check if trying to delete another SUPER_ADMIN (only SUPER_ADMIN can delete SUPER_ADMIN)
  if (admin.role === "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot delete another Super Admin");
  }


  admin.isDeleted = true;
  await admin.save();

  // Remove password from response
  const adminData = admin.toObject();
  delete adminData.password;

  return adminData;
};


export const UserServices = {
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
    deleteAdmin
};