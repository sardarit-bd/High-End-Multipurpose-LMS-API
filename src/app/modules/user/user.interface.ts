import { Types } from "mongoose"

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ORGANIZATION = 'ORGANIZATION'
}

export interface IAuthProvider {
    provider: 'google' | 'credentials' | 'facebook',
    providerId : string
}

export enum IsActive {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'
}
export interface IUser {
    _id?: Types.ObjectId,
    name: string,
    email: string,
    password?: string,
    phone?: string,
    picture ?: string,
    address ?: string,
    isDeleted ?: string,
    isActive ?: IsActive,
    isVerified ?: boolean,
    role: Role,
    auths: IAuthProvider[],
    createdAt?: Date
}