import { SlidersHorizontal } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const aiConfigurationModule = {
  title: "AI Configuration",
  href: "/ai-configuration",
  icon: SlidersHorizontal,
  description: "Sample provider, model, and task configuration.",
  summary:
    "Configure sample AI providers, models, workflow tasks, safety preferences, and usage limits. This demo does not contact a provider or store API keys.",
  emptyTitle: "No AI configuration",
  emptyDescription:
    "Sample AI configuration stays in this browser session and is not saved to the RoundsAI backend.",
} satisfies FoundationModule;

export { AI_CONFIGURATION_SAMPLE_NOTICE, aiUsageSample, sampleAiConfiguration } from "@/features/ai-configuration/sample-data";
export {
  activeTasksForModel,
  activeTasksForProvider,
  aiConnectionLabel,
  assignedTaskCount,
  modelById,
  modelsForProvider,
  providerActivationIssue,
  providerById,
  selectableFallbackModels,
  selectableModels,
  summarizeAiConfiguration,
  taskCapability,
  tasksUsingModel,
  toModelFormValues,
  toProviderFormValues,
  toTaskFormValues,
} from "@/features/ai-configuration/selectors";
export {
  aiSafetySchema,
  createAiModelSchema,
  createAiProviderSchema,
  createAiTaskSchema,
  createAiUsageSchema,
  emptyAiModelForm,
  emptyAiProviderForm,
} from "@/features/ai-configuration/schema";
export {
  aiCapabilities,
  aiConfigStatuses,
  aiConfigurationPermissionId,
  aiProviderTypes,
  aiTaskIds,
} from "@/features/ai-configuration/types";
export type {
  AiCapability,
  AiConfigStatus,
  AiConfigWriteResult,
  AiConfiguration,
  AiModel,
  AiModelFormValues,
  AiProvider,
  AiProviderFormValues,
  AiSafetyFormValues,
  AiTaskConfig,
  AiTaskFormValues,
  AiTaskId,
  AiUsageLimitsFormValues,
} from "@/features/ai-configuration/types";
