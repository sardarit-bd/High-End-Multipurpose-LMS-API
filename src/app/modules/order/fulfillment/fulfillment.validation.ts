import z from "zod";

export const fulfillOrderZod = z.object({
  status: z.enum(["processing", "shipped"]).default("shipped"),
  trackingNumber: z.string().min(2).optional(),
  carrier: z.string().min(2).optional(),
});

export const updateTrackingZod = z.object({
  trackingNumber: z.string().min(2),
  carrier: z.string().min(2).optional(),
  status: z.enum(["processing", "shipped"]).optional(),
});

export const markDeliveredZod = z.object({
  deliveredAt: z.string().datetime().optional(), // ISO string; defaults now()
});

export const cancelOrderZod = z.object({
  reason: z.string().min(3).optional(),
  restock: z.boolean().default(true), // if paid & physical, decide policy before enabling
});
