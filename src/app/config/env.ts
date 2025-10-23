import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
    PORT: string;
    DB_URL: string;
    NODE_ENV: "development" | "production";
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    BCRYPT_SALT_ROUND: string;
    SUPER_ADMIN_EMAIL: string;
    SUPER_ADMIN_PASSWORD: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
    EXPRESS_SESSION_SECRET: string;
    FRONTEND_URL: string;

    PAYMENT: {
        STRIPE_SECRET_KEY: string;
        STRIPE_SUCCESS_URL: string;
        STRIPE_CANCEL_URL: string;
        STRIPE_WEBHOOK_SECRET: string;
    }
    CLOUDINARY: {
        CLOUD_NAME: string;
        API_KEY: string;
        API_SECRET: string;
    };
    EMAIL_SENDER: {
        SMTP_PASS: string;
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_USER: string;
        SMTP_FROM: string;
    };
    REDIS: {
        REDIS_USERNAME: string;
        REDIS_PASSWORD: string;
        REDIS_HOST: string;
        REDIS_PORT: string;
    };
}

const loadEnvVariables = (): EnvConfig => {
    const requiredEnvVariables: string[] = [
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
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | "production",
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,

        // SSL
        PAYMENT: {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
            STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL as string,
            STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL as string,
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
        },  

        // cloudinary
        CLOUDINARY: {
            API_KEY: process.env.CLOUDINARY_API_KEY as string,
            API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
            CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
        },

        EMAIL_SENDER: {
            SMTP_FROM: process.env.SMTP_FROM as string,
            SMTP_USER: process.env.SMTP_USER as string,
            SMTP_HOST: process.env.SMTP_HOST as string,
            SMTP_PASS: process.env.SMTP_PASS as string,
            SMTP_PORT: process.env.SMTP_PORT as string,
        },

        REDIS: {
            REDIS_USERNAME: process.env.REDIS_USERNAME as string,
            REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
            REDIS_HOST: process.env.REDIS_HOST as string,
            REDIS_PORT: process.env.REDIS_PORT as string,
        },
    };
};
export const envVars: EnvConfig = loadEnvVariables();