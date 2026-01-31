/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { UserServices } from "./user.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUser } from "./user.interface";

const createUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const user = await UserServices.createUser(req.body);

        sendResponse<IUser>(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "User Created Successfully",
            data: user,
        });
    }
);

const getMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const verifiedToken = req.user as JwtPayload;

         const user = (await UserServices.getMe(verifiedToken.userId)) as IUser;

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User profile fetched successfully",
            data: user,
        });
    }
);
const getStudentProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const student = await UserServices.getStudentProfile(id);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Student profile fetched successfully",
            data: student,
        });
    }
);
const updateMe = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const verifiedToken = req.user as JwtPayload;

        const user = await UserServices.updateMe(verifiedToken.userId, req.body);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    }
);

const getInstructor = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const {id} = req.params;

         const user = await UserServices.getInstructor(id);

        sendResponse(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Instructor is fetched Successfully",
            data: user,
        });
    }
);

const getAllInstructors = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const instructors = await UserServices.getAllInstructors(req.query);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Instructors fetched Successfully",
            data: instructors,
        });
    }
);

const getUniqueExpertise = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const instructors = await UserServices.getUniqueExpertise();

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Unique Experties fetched Successfully",
            data: instructors,
        });
    }
);

const getAllStudents = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const instructors = await UserServices.getAllStudents(req.query);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Students fetched Successfully",
            data: instructors,
        });
    }
);
const requestInstructor = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const user = await UserServices.requestInstructor(token.userId, req.body?.note);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Instructor request submitted",
    data: user,
  });
});

const approveInstructor = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  const { userId } = req.body;

  const user = await UserServices.approveInstructor(userId, { userId: token.userId, role: token.role }, {
    action: req.body?.action ?? "approve",
    note: req.body?.note,
  });

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: req.body?.action === "reject" ? "Request rejected" : "User promoted to instructor",
    data: user,
  });
});


const updateInstructor = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  
  const updated = await UserServices.updateInstructor(req.params.id, req.body, {
    userId: token.userId,
    role: token.role,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile Updated Successfully",
    data: updated,
  });
});

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const token = req.user as JwtPayload;
  
  const result = await UserServices.getAllAdmins(req.query, {
    userId: token.userId,
    role: token.role
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admins fetched successfully",
    data: result
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  
  const result = await UserServices.createAdmin(req.body, {
    userId: token.userId,
    role: token.role
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const token = req.user as JwtPayload;
  
  const result = await UserServices.deleteAdmin(req.params.id, {
    userId: token.userId,
    role: token.role
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result
  });
});

export const userController = {
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