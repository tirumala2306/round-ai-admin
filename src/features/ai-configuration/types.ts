export const aiProviderTypes = ["Language model"] as const;

export const aiConfigStatuses = ["Active", "Inactive"] as const;

export const aiCapabilities = [
  "Summarization",
  "Prioritization",
  "Presentation",
  "Clinical drafting",
  "Clinical reasoning",
  "Evidence retrieval",
] as const;

export const aiTaskIds = [
  "patient-summary",
  "patient-prioritization",
  "rounds-presentation",
  "clinical-note-drafting",
  "clinical-considerations",
  "evidence-qa",
] as const;

/** Existing permission for this screen. Hospital Admin receives every permission, including this one. */
export const aiConfigurationPermissionId = "settings.ai";

export type AiProviderType = (typeof aiProviderTypes)[number];
export type AiConfigStatus = (typeof aiConfigStatuses)[number];
export type AiCapability = (typeof aiCapabilities)[number];
export type AiTaskId = (typeof aiTaskIds)[number];

export type AiProvider = {
  id: string;
  name: string;
  identifier: string;
  description: string;
  providerType: AiProviderType;
  defaultModelId: string | null;
  status: AiConfigStatus;
  createdAt: string;
  updatedAt: string;
};

export type AiModel = {
  id: string;
  providerId: string;
  name: string;
  description: string;
  capabilities: AiCapability[];
  status: AiConfigStatus;
  createdAt: string;
  updatedAt: string;
};

export type AiTaskConfig = {
  id: AiTaskId;
  name: string;
  description: string;
  providerId: string;
  modelId: string;
  fallbackModelId: string | null;
  status: AiConfigStatus;
  maxOutputTokens: number;
  updatedAt: string;
};

export type AiSafetySettings = {
  requireClinicianReview: boolean;
  preventSignedNoteTreatment: boolean;
  displayAiIndicators: boolean;
  requireSupportingEvidence: boolean;
  enableFallbackWhenUnavailable: boolean;
  updatedAt: string;
};

export type AiUsageLimits = {
  maxTokensPerRequest: number;
  dailyUsageThreshold: number;
  monthlyUsageThreshold: number;
  warningThresholdPercent: number;
  usageAlertsEnabled: boolean;
  updatedAt: string;
};

export type AiConfiguration = {
  providers: AiProvider[];
  models: AiModel[];
  tasks: AiTaskConfig[];
  safety: AiSafetySettings;
  usageLimits: AiUsageLimits;
};

export type AiProviderFormValues = {
  name: string;
  identifier: string;
  description: string;
  providerType: AiProviderType;
  defaultModelId: string;
  status: AiConfigStatus;
};

export type AiModelFormValues = {
  providerId: string;
  name: string;
  description: string;
  capabilities: AiCapability[];
  status: AiConfigStatus;
};

export type AiTaskFormValues = {
  description: string;
  providerId: string;
  modelId: string;
  fallbackModelId: string;
  status: AiConfigStatus;
  maxOutputTokens: number;
};

export type AiSafetyFormValues = Omit<AiSafetySettings, "updatedAt">;

export type AiUsageLimitsFormValues = Omit<AiUsageLimits, "updatedAt">;

export type AiConfigWriteResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export type AiFieldIssue = {
  path: string;
  message: string;
};
