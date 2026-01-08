import { AnyZodObject } from "zod";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { envVars } from "../config/env";

export const connectDatabase = () => async (req: Request, res: Response, next: NextFunction) => {

    try {
        // Connect to database logic would go here
        await mongoose.connect(envVars.DB_URL);
        console.log("Connected to DB");
        next();
    } catch (error) {
        next(error);
    }
};