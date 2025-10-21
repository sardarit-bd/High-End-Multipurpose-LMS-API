import z from "zod";

export const unitIdParamZod = z.object({
    unitId: z.string().min(1, "unitId is required"),
});

export const createLessonZod = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    contentType: z.enum(["video", "article", "pdf", "audio", "link"]),
    contentUrl: z.string().url(),
    durationSec: z.number().int().min(1).optional(),
    orderIndex: z.number().int().min(1).default(1),
    unit: z.string().min(1, "unitId is required")
});
