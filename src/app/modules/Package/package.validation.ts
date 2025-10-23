import z from "zod";

export const createPackageZod = z.object({
  name: z.record(z.string()).refine(v => Object.keys(v).length > 0, "name i18n required"),
  courseIds: z.array(z.string().min(1)).min(1),
  features: z.array(z.string()).default([]),
  price: z.number().int().min(0),
  offerPrice: z.number().int().min(0).optional(),
  currency: z.string().min(3).max(3).default("USD"),
  accessDays: z.number().int().min(1).optional(),
  isActive: z.boolean().optional()
});

export const updatePackageZod = createPackageZod.partial();

export const pkgIdParamsZod = z.object({ packageId: z.string().min(1) });
