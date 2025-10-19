import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name must be a string" })
        .min(2, { message: "Name too short: Minimum 2 character long" })
        .max(50, { message: "Name too long: Maximum 50 character" }),
    email: z
        .string({
            invalid_type_error: "Password must be a string",
        })
        .email({
            message: "Invalid email address formate",
        })
        .min(5, { message: "Email must be at least 5 character long" })
        .max(100, {
            message: "Email can not exceed 100 characters",
        }),
    password: z
        .string({
            invalid_type_error: "Password mus be a string",
        })
        .min(8, {
            message: "Password must be at least 8 characters long",
        })
        .regex(/^(?=.*[A-Z])/, {
            message: "Password must contain at least 1 uppercase",
        })
        .regex(/^(?=.*[!@#$%^&*])/, {
            message: "Password must contain at least 1 special character.",
        })
        .regex(/^(?=.*\d)/, {
            message: "Password must bet contain at least 1 number",
        }),
    role: z.enum(Object.values(Role) as [string]).optional(),
    phone: z
        .string({ invalid_type_error: "Phone must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message:
                "Phone number must be valid for Bangladesh. Formate: +8801xxxxxxx or 01xxxxxx",
        })
        .optional(),
    address: z
        .string({ invalid_type_error: "Address must be string" })
        .max(200, { message: "Address can not exceed 200 characters." })
        .optional(),
});

export const updateUserZodSchema = z.object({
    name: z
        .string({ invalid_type_error: "Name must be a string" })
        .min(2, { message: "Name too short: Minimum 2 character long" })
        .max(50, { message: "Name too long: Maximum 50 character" })
        .optional(),
    phone: z
        .string({ invalid_type_error: "Phone must be string" })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message:
                "Phone number must be valid for Bangladesh. Formate: +8801xxxxxxx or 01xxxxxx",
        })
        .optional(),
    address: z
        .string({ invalid_type_error: "Address must be string" })
        .max(200, { message: "Address can not exceed 200 characters." })
        .optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    isActive: z.enum(Object.values(IsActive) as [string]).optional(),
    isDeleted: z
        .boolean({ invalid_type_error: "isDeleted must be true or false" })
        .optional(),
    isVerified: z
        .boolean({ invalid_type_error: "isVerified must be tru or false" })
        .optional(),
});