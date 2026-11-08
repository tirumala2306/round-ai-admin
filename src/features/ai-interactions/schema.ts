import { z } from "zod";
import { flagReasons, reviewStatuses } from "@/features/ai-interactions/types";

export const flagInteractionSchema = z.object({
  reason: z.enum(flagReasons, "Choose a flag reason."),
  notes: z.string().trim().max(500, "Use 500 characters or fewer."),
});

export const reviewInteractionSchema = z.object({
  reviewStatus: z.enum(reviewStatuses, "Choose a review status."),
  reviewNotes: z.string().trim().max(500, "Use 500 characters or fewer."),
});

export type FlagInteractionValues = z.infer<typeof flagInteractionSchema>;
export type ReviewInteractionValues = z.infer<typeof reviewInteractionSchema>;
