import z from "zod";


export const createTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  type: z.enum(["quiz","video","pdf"]),
  perCorrectPoint: z.number().int().min(0).optional(), // required if type=quiz
  maxPoints: z.number().int().min(0).optional(),
  quizId: z.string().optional(), // required if type=quiz
});

export const unitParamZod = z.object({ unitId: z.string().min(1) });

