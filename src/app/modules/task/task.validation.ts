import z from "zod";


export const createTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["quiz","video","pdf"]),
  maxPoints: z.number().int().min(0).optional(),
  quizId: z.string().optional(), // required if type=quiz
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").optional(),
  description: z.string().optional(),
  type: z.enum(["quiz","video","pdf"]).optional(),
  maxPoints: z.number().int().min(0).optional(),
  quizId: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["draft","active","expired"]).optional(),
}).optional();

export const unitParamZod = z.object({ unitId: z.string().min(1) });

