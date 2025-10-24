import z from "zod";

export const createBadgeZod = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  type: z.enum(["course", "event", "custom"]),
  courseId: z.string().optional(),
  eventId: z.string().optional(),
  pointsRequired: z.number().optional(),
});

export const updateBadgeZod = createBadgeZod.partial();

export const badgeIdParamZod = z.object({
  badgeId: z.string().min(1),
});
