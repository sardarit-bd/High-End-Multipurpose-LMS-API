import z from "zod";

export const taskIdParamZod = z.object({ taskId: z.string().min(1) });

export const createReviewedSubmissionZod = z.object({
  artifactUrl: z.string().url(),
  note: z.string().max(500).optional()
});

// Instructor grading body
export const gradeSubmissionZod = z.object({
  pointsAwarded: z.number().int().min(0),
  status: z.enum(["approved","rejected"])
});
