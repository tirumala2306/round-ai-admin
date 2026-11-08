import type { AiFeatureId, AiModelId } from "@/features/ai-monitoring/types";

export const interactionStatuses = ["Success", "Failed"] as const;

export type InteractionStatus = (typeof interactionStatuses)[number];

export const feedbackStates = ["Positive", "Negative", "No Feedback"] as const;

export type FeedbackState = (typeof feedbackStates)[number];

export const reviewStatuses = [
  "Pending Review",
  "Under Review",
  "Reviewed",
  "Dismissed",
] as const;

export type ReviewStatus = (typeof reviewStatuses)[number];

export const flagReasons = [
  "Potentially Incomplete Response",
  "Irrelevant Response",
  "Unsupported Information",
  "Response Quality Concern",
  "User Reported Issue",
] as const;

export type FlagReason = (typeof flagReasons)[number];

export const interactionDateRanges = ["all", "24h", "7d", "30d"] as const;

export type InteractionDateRange = (typeof interactionDateRanges)[number];

/** Sample clock shared with AI Monitoring so server and browser windows match. */
export const interactionAsOf = "2026-11-05T17:00:00.000Z";

/**
 * One synthetic AI interaction.
 * userId and organizationId point at the shared directory.
 * A later API can return this shape without changing the review screen.
 */
export type AiInteraction = {
  id: string;
  userId: string;
  organizationId: string;
  featureId: AiFeatureId;
  question: string;
  response: string;
  modelId: AiModelId;
  provider: string;
  timestamp: string;
  responseTimeMs: number;
  inputTokens: number;
  outputTokens: number;
  status: InteractionStatus;
  feedback: FeedbackState;
  feedbackComment: string;
  reviewStatus: ReviewStatus | null;
  flagReason: FlagReason | null;
  reviewNotes: string;
  reviewedAt: string | null;
};

export type InteractionListItem = AiInteraction & {
  userName: string;
  organizationName: string;
  featureLabel: string;
  modelName: string;
  estimatedCost: number;
  flagged: boolean;
};

export type InteractionSummary = {
  total: number;
  successful: number;
  flagged: number;
  positive: number;
  negative: number;
  averageResponseTimeMs: number;
};

export type InteractionFilters = {
  search: string;
  organizationId: string;
  featureId: AiFeatureId | "all";
  modelId: AiModelId | "all";
  status: InteractionStatus | "All";
  feedback: FeedbackState | "All";
  review: ReviewStatus | "Not flagged" | "All";
  range: InteractionDateRange;
};
