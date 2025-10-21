import z from "zod";
const scoringZ = z.object({
  quizCorrectPoint: z.number().int().min(0).default(5),
  attendancePoint: z.number().int().min(0).default(10),
});
export const createCourseZodSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  scoring: scoringZ.optional(),
  awardOnComplete: z.string().optional()
});

export const updateCourseZodSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  thumbnail: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  scoring: scoringZ.optional(),
  awardOnComplete: z.string().optional()
});

export const listCourseQueryZodSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  instructor: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});
