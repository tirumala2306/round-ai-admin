export const aiTimeRanges = ["24h", "7d", "30d"] as const;

export type AiTimeRange = (typeof aiTimeRanges)[number];

export const aiFeatureIds = [
  "patient-summaries",
  "rounds-preparation",
  "clinical-notes",
  "clinical-considerations",
  "evidence-retrieval",
] as const;

export type AiFeatureId = (typeof aiFeatureIds)[number];

export const aiModelIds = [
  "rounds-clinical-v1",
  "rounds-notes-v1",
  "rounds-evidence-v1",
] as const;

export type AiModelId = (typeof aiModelIds)[number];

export const aiErrorTypes = [
  "API Timeout",
  "Rate Limit Exceeded",
  "Invalid Response",
  "Provider Unavailable",
  "Request Validation Failed",
] as const;

export type AiErrorType = (typeof aiErrorTypes)[number];

export const aiErrorStatuses = ["Open", "Acknowledged", "Resolved"] as const;

export type AiErrorStatus = (typeof aiErrorStatuses)[number];

export type AiRequestStatus = "Success" | "Failed";

/** One synthetic AI request. A later API can return this shape. */
export type AiRequestRecord = {
  id: string;
  organizationId: string;
  featureId: AiFeatureId;
  modelId: AiModelId;
  provider: string;
  occurredAt: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  status: AiRequestStatus;
  errorId?: string;
  errorType?: AiErrorType;
  errorStatus?: AiErrorStatus;
  errorDetail?: string;
};

export type MonitoringFilters = {
  range: AiTimeRange;
  organizationId: string;
  featureId: AiFeatureId | "all";
  modelId: AiModelId | "all";
};

export type MonitoringSummary = {
  total: number;
  successful: number;
  failed: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  successRate: number;
  failureRate: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  averageCost: number;
  activeModels: number;
};

export type MonitoringBucket = {
  label: string;
  total: number;
  successful: number;
  failed: number;
  averageLatencyMs: number;
  estimatedCost: number;
};

export type OrganizationUsage = {
  organizationId: string;
  name: string;
  requests: number;
  tokens: number;
  percentage: number;
  estimatedCost: number;
};

export type NamedUsage = {
  id: string;
  label: string;
  requests: number;
  tokens: number;
  percentage: number;
  estimatedCost: number;
};

export type MonitoringErrorRecord = {
  errorId: string;
  requestId: string;
  occurredAt: string;
  organizationId: string;
  organizationName: string;
  featureId: AiFeatureId;
  featureLabel: string;
  modelId: AiModelId;
  modelName: string;
  provider: string;
  errorType: AiErrorType;
  errorStatus: AiErrorStatus;
  errorDetail: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
};

export type MonitoringView = {
  summary: MonitoringSummary;
  previous: MonitoringSummary;
  buckets: MonitoringBucket[];
  organizations: OrganizationUsage[];
  features: NamedUsage[];
  models: NamedUsage[];
  costByModel: NamedUsage[];
  costByOrganization: OrganizationUsage[];
  errors: MonitoringErrorRecord[];
};
