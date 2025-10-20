import z from "zod";

export const courseIdParamZod = z.object({
  courseId: z.string().min(1, "courseId is required"),
});

export const createUnitZod = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  orderIndex: z.number().int().min(1).default(1),
    course: z.string().min(1, "courseId is required"),
});
