import z from "zod";

export const courseParamZod = z.object({ courseId: z.string().min(1) });
export const enrollmentIdParamZod = z.object({ courseId: z.string().min(1), enrollmentId: z.string().min(1) });

export const updateStatusZod = z.object({ status: z.enum(["enrolled","completed","dropped"]) });
export const updateProgressZod = z.object({ progress: z.number().int().min(0).max(100) });
