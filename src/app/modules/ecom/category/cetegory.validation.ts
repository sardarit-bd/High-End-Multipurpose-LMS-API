import z from "zod";

export const createCategoryZod = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parent: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});
