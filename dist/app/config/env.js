"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariables = () => {
    const requiredEnvVariables = [
        "PORT",
        "DB_URL",
        "NODE_ENV",
        "JWT_ACCESS_SECRET",
        "JWT_ACCESS_EXPIRES",
        "BCRYPT_SALT_ROUND",
        "SUPER_ADMIN_EMAIL",
        "SUPER_ADMIN_PASSWORD",
        "JWT_REFRESH_EXPIRES",
        "JWT_REFRESH_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CALLBACK_URL",
        "EXPRESS_SESSION_SECRET",
        "FRONTEND_URL",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "STRIPE_SUCCESS_URL",
        "STRIPE_CANCEL_URL",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "SMTP_FROM",
        "SMTP_USER",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_PASS",
        "REDIS_USERNAME",
        "REDIS_PASSWORD",
        "REDIS_HOST",
        "REDIS_PORT"
    ];
    requiredEnvVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        FRONTEND_URL: process.env.FRONTEND_URL,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        // SSL
        PAYMENT: {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
            STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL,
            STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL,
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        },
        // cloudinary
        CLOUDINARY: {
            API_KEY: process.env.CLOUDINARY_API_KEY,
            API_SECRET: process.env.CLOUDINARY_API_SECRET,
            CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        },
        EMAIL_SENDER: {
            SMTP_FROM: process.env.SMTP_FROM,
            SMTP_USER: process.env.SMTP_USER,
            SMTP_HOST: process.env.SMTP_HOST,
            SMTP_PASS: process.env.SMTP_PASS,
            SMTP_PORT: process.env.SMTP_PORT,
        },
        REDIS: {
            REDIS_USERNAME: process.env.REDIS_USERNAME,
            REDIS_PASSWORD: process.env.REDIS_PASSWORD,
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: process.env.REDIS_PORT,
        },
    };
};
exports.envVars = loadEnvVariables();
