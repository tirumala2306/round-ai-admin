import { z } from "zod";
import {
  modelFieldIssues,
  providerFieldIssues,
  taskFieldIssues,
  usageLimitIssues,
} from "@/features/ai-configuration/selectors";
import {
  aiCapabilities,
  aiConfigStatuses,
  aiProviderTypes,
  type AiConfiguration,
  type AiModelFormValues,
  type AiProviderFormValues,
  type AiSafetyFormValues,
  type AiTaskFormValues,
  type AiTaskId,
  type AiUsageLimitsFormValues,
} from "@/features/ai-configuration/types";

const providerObject = z.object({
  name: z.string().trim().min(1, "Enter a provider name.").min(2, "Enter at least 2 characters.").max(80),
  identifier: z.string().trim().min(1, "Enter a provider identifier.").max(41),
  description: z.string().trim().min(1, "Enter a description.").max(400, "Use 400 characters or fewer."),
  providerType: z.enum(aiProviderTypes, "Select a provider type."),
  defaultModelId: z.string(),
  status: z.enum(aiConfigStatuses, "Select a status."),
});

const modelObject = z.object({
  providerId: z.string().min(1, "Select a provider."),
  name: z.string().trim().min(1, "Enter a model name.").min(2, "Enter at least 2 characters.").max(80),
  description: z.string().trim().min(1, "Enter a description.").max(400, "Use 400 characters or fewer."),
  capabilities: z.array(z.enum(aiCapabilities)).min(1, "Select at least one capability."),
  status: z.enum(aiConfigStatuses, "Select a status."),
});

const taskObject = z.object({
  description: z.string().trim().min(1, "Enter a description.").max(400, "Use 400 characters or fewer."),
  providerId: z.string().min(1, "Select a provider."),
  modelId: z.string().min(1, "Select a model."),
  fallbackModelId: z.string(),
  status: z.enum(aiConfigStatuses, "Select a status."),
  maxOutputTokens: z
    .number({ error: "Enter a positive whole number of tokens." })
    .int("Enter a whole number of tokens.")
    .positive("Enter a positive whole number of tokens.")
    .max(32000, "Use 32,000 tokens or fewer."),
});

const usageObject = z.object({
  maxTokensPerRequest: z
    .number({ error: "Enter a positive whole number of tokens." })
    .int("Enter a whole number of tokens.")
    .positive("Enter a positive whole number of tokens.")
    .max(200000, "Use 200,000 tokens or fewer."),
  dailyUsageThreshold: z
    .number({ error: "Enter a positive daily usage threshold." })
    .int("Enter a whole number.")
    .positive("Enter a positive daily usage threshold.")
    .max(100000000, "Use a smaller daily threshold."),
  monthlyUsageThreshold: z
    .number({ error: "Enter a positive monthly usage threshold." })
    .int("Enter a whole number.")
    .positive("Enter a positive monthly usage threshold.")
    .max(1000000000, "Use a smaller monthly threshold."),
  warningThresholdPercent: z
    .number({ error: "Enter a warning threshold from 1 to 100 percent." })
    .int("Enter a whole number.")
    .min(1, "Enter a warning threshold from 1 to 100 percent.")
    .max(100, "Enter a warning threshold from 1 to 100 percent."),
  usageAlertsEnabled: z.boolean(),
});

export const aiSafetySchema = z.object({
  requireClinicianReview: z.boolean(),
  preventSignedNoteTreatment: z.boolean(),
  displayAiIndicators: z.boolean(),
  requireSupportingEvidence: z.boolean(),
  enableFallbackWhenUnavailable: z.boolean(),
});

export function createAiProviderSchema(config: AiConfiguration, exceptProviderId?: string) {
  return providerObject.superRefine((values, context) => {
    for (const issue of providerFieldIssues(config, values as AiProviderFormValues, exceptProviderId)) {
      context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  });
}

export function createAiModelSchema(config: AiConfiguration, exceptModelId?: string) {
  return modelObject.superRefine((values, context) => {
    for (const issue of modelFieldIssues(config, values as AiModelFormValues, exceptModelId)) {
      context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  });
}

export function createAiTaskSchema(config: AiConfiguration, taskId: AiTaskId) {
  return taskObject.superRefine((values, context) => {
    for (const issue of taskFieldIssues(config, taskId, values as AiTaskFormValues)) {
      context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  });
}

export function createAiUsageSchema(config: AiConfiguration) {
  return usageObject.superRefine((values, context) => {
    for (const issue of usageLimitIssues(config, values as AiUsageLimitsFormValues)) {
      context.addIssue({ code: "custom", path: [issue.path], message: issue.message });
    }
  });
}

export function emptyAiProviderForm(): AiProviderFormValues {
  return {
    name: "",
    identifier: "",
    description: "",
    providerType: "Language model",
    defaultModelId: "",
    status: "Active",
  };
}

export function emptyAiModelForm(providerId = ""): AiModelFormValues {
  return {
    providerId,
    name: "",
    description: "",
    capabilities: [],
    status: "Active",
  };
}

export type { AiSafetyFormValues };
