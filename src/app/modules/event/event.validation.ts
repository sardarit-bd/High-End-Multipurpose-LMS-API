import z from "zod";


export const createEventZod = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  pointsReward: z.number().min(0).default(0),
  badgeId: z.string().optional(),
});


export const eventIdParamZod = z.object({
  eventId: z.string().min(1),
});
