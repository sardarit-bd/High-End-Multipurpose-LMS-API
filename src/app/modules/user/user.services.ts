import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
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

    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
};
const getMe = async (userId: string) => {
    return "sohel"
};



export const UserServices = {
    getMe,
    createUser
};