import type {
  AiCapability,
  AiConfigStatus,
  AiConfiguration,
  AiFieldIssue,
  AiModel,
  AiModelFormValues,
  AiProvider,
  AiProviderFormValues,
  AiTaskConfig,
  AiTaskFormValues,
  AiTaskId,
  AiUsageLimitsFormValues,
} from "@/features/ai-configuration/types";

export const taskCapability: Record<AiTaskId, AiCapability> = {
  "patient-summary": "Summarization",
  "patient-prioritization": "Prioritization",
  "rounds-presentation": "Presentation",
  "clinical-note-drafting": "Clinical drafting",
  "clinical-considerations": "Clinical reasoning",
  "evidence-qa": "Evidence retrieval",
};

export function aiConnectionLabel(status: AiConfigStatus) {
  return status === "Active" ? "Demo configuration ready" : "Demo configuration paused";
}

export function summarizeAiConfiguration(config: AiConfiguration) {
  return {
    totalProviders: config.providers.length,
    activeProviders: config.providers.filter((provider) => provider.status === "Active").length,
    configuredTasks: config.tasks.length,
    disabledTasks: config.tasks.filter((task) => task.status === "Inactive").length,
  };
}

export function providerById(config: AiConfiguration, providerId: string) {
  return config.providers.find((provider) => provider.id === providerId);
}

export function modelById(config: AiConfiguration, modelId: string | null) {
  if (!modelId) {
    return undefined;
  }
  return config.models.find((model) => model.id === modelId);
}

export function modelsForProvider(config: AiConfiguration, providerId: string) {
  return config.models
    .filter((model) => model.providerId === providerId)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function assignedTaskCount(config: AiConfiguration, providerId: string) {
  return config.tasks.filter((task) => taskUsesProvider(config, task, providerId)).length;
}

export function tasksUsingModel(config: AiConfiguration, modelId: string) {
  return config.tasks.filter(
    (task) => task.modelId === modelId || task.fallbackModelId === modelId,
  );
}

export function taskUsesProvider(config: AiConfiguration, task: AiTaskConfig, providerId: string) {
  if (task.providerId === providerId) {
    return true;
  }
  const fallback = modelById(config, task.fallbackModelId);
  return fallback?.providerId === providerId;
}

export function selectableModels(config: AiConfiguration, taskId: AiTaskId, providerId: string) {
  const capability = taskCapability[taskId];
  const provider = providerById(config, providerId);
  if (!provider || provider.status !== "Active") {
    return [];
  }
  return modelsForProvider(config, providerId).filter(
    (model) => model.status === "Active" && model.capabilities.includes(capability),
  );
}

export function selectableFallbackModels(
  config: AiConfiguration,
  taskId: AiTaskId,
  primaryModelId: string,
) {
  const capability = taskCapability[taskId];
  return config.models.filter((model) => {
    if (model.id === primaryModelId || model.status !== "Active") {
      return false;
    }
    if (!model.capabilities.includes(capability)) {
      return false;
    }
    const provider = providerById(config, model.providerId);
    return provider?.status === "Active";
  });
}

function normalized(value: string) {
  return value.trim().toLowerCase();
}

export function hasDuplicateProviderName(
  config: AiConfiguration,
  name: string,
  exceptProviderId?: string,
) {
  const target = normalized(name);
  return config.providers.some(
    (provider) => provider.id !== exceptProviderId && normalized(provider.name) === target,
  );
}

export function hasDuplicateProviderIdentifier(
  config: AiConfiguration,
  identifier: string,
  exceptProviderId?: string,
) {
  const target = normalized(identifier);
  return config.providers.some(
    (provider) => provider.id !== exceptProviderId && provider.identifier === target,
  );
}

export function hasDuplicateModelName(
  config: AiConfiguration,
  providerId: string,
  name: string,
  exceptModelId?: string,
) {
  const target = normalized(name);
  return config.models.some(
    (model) =>
      model.providerId === providerId &&
      model.id !== exceptModelId &&
      normalized(model.name) === target,
  );
}

export function providerFieldIssues(
  config: AiConfiguration,
  values: AiProviderFormValues,
  exceptProviderId?: string,
): AiFieldIssue[] {
  const issues: AiFieldIssue[] = [];
  const identifier = values.identifier.trim().toLowerCase();

  if (hasDuplicateProviderName(config, values.name, exceptProviderId)) {
    issues.push({
      path: "name",
      message: "A provider with this name is already in the sample list.",
    });
  }

  if (!/^[a-z][a-z0-9-]{1,40}$/.test(identifier)) {
    issues.push({
      path: "identifier",
      message: "Use a lowercase identifier with letters, numbers, and hyphens.",
    });
  } else if (hasDuplicateProviderIdentifier(config, identifier, exceptProviderId)) {
    issues.push({
      path: "identifier",
      message: "This provider identifier is already in use.",
    });
  }

  const providerModels = config.models.filter((model) => model.providerId === exceptProviderId);
  if (values.defaultModelId) {
    const model = providerModels.find((item) => item.id === values.defaultModelId);
    if (!model) {
      issues.push({
        path: "defaultModelId",
        message: "Select a model that belongs to this provider.",
      });
    } else if (values.status === "Active" && model.status !== "Active") {
      issues.push({
        path: "defaultModelId",
        message: "The default model must be active while the provider is active.",
      });
    }
  } else if (values.status === "Active" && providerModels.some((model) => model.status === "Active")) {
    issues.push({
      path: "defaultModelId",
      message: "Select a default model for this provider.",
    });
  }

  if (values.status === "Inactive" && exceptProviderId && activeTasksForProvider(config, exceptProviderId).length > 0) {
    issues.push({
      path: "status",
      message: "Reassign active tasks that use this provider before pausing it.",
    });
  }

  return issues;
}

export function activeTasksForProvider(config: AiConfiguration, providerId: string) {
  return config.tasks.filter(
    (task) => task.status === "Active" && taskUsesProvider(config, task, providerId),
  );
}

export function modelFieldIssues(
  config: AiConfiguration,
  values: AiModelFormValues,
  exceptModelId?: string,
): AiFieldIssue[] {
  const issues: AiFieldIssue[] = [];
  const provider = providerById(config, values.providerId);

  if (!provider) {
    issues.push({ path: "providerId", message: "Select a provider." });
  }

  if (provider && hasDuplicateModelName(config, values.providerId, values.name, exceptModelId)) {
    issues.push({
      path: "name",
      message: "This provider already has a model with this name.",
    });
  }

  if (values.capabilities.length === 0) {
    issues.push({ path: "capabilities", message: "Select at least one capability." });
  }

  if (values.status === "Inactive" && exceptModelId) {
    if (activeTasksForModel(config, exceptModelId).length > 0) {
      issues.push({
        path: "status",
        message: "Reassign active tasks that use this model before pausing it.",
      });
    }
    if (config.providers.some((item) => item.status === "Active" && item.defaultModelId === exceptModelId)) {
      issues.push({
        path: "status",
        message: "Choose another default model before pausing this one.",
      });
    }
  }

  return issues;
}

export function activeTasksForModel(config: AiConfiguration, modelId: string) {
  return config.tasks.filter(
    (task) =>
      task.status === "Active" &&
      (task.modelId === modelId || task.fallbackModelId === modelId),
  );
}

export function providerActivationIssue(config: AiConfiguration, provider: AiProvider) {
  const models = modelsForProvider(config, provider.id);
  const activeModels = models.filter((model) => model.status === "Active");
  if (activeModels.length === 0) {
    return null;
  }
  const defaultModel = modelById(config, provider.defaultModelId);
  if (!defaultModel || defaultModel.providerId !== provider.id || defaultModel.status !== "Active") {
    return "Select an active default model before enabling this provider.";
  }
  return null;
}

export function taskFieldIssues(
  config: AiConfiguration,
  taskId: AiTaskId,
  values: AiTaskFormValues,
): AiFieldIssue[] {
  const issues: AiFieldIssue[] = [];
  const capability = taskCapability[taskId];
  const provider = providerById(config, values.providerId);
  const model = modelById(config, values.modelId);

  if (!provider) {
    issues.push({ path: "providerId", message: "Select a provider." });
  } else if (provider.status !== "Active") {
    issues.push({
      path: "providerId",
      message: "A task cannot use a paused provider.",
    });
  }

  if (!model || model.providerId !== values.providerId) {
    issues.push({
      path: "modelId",
      message: "Select a model from the assigned provider.",
    });
  } else if (model.status !== "Active") {
    issues.push({
      path: "modelId",
      message: "A task cannot use a paused model.",
    });
  } else if (!model.capabilities.includes(capability)) {
    issues.push({
      path: "modelId",
      message: `Select a model that supports ${capability}.`,
    });
  }

  if (values.fallbackModelId) {
    issues.push(...fallbackIssues(config, capability, values.fallbackModelId, model));
  }

  if (!Number.isInteger(values.maxOutputTokens) || values.maxOutputTokens < 1) {
    issues.push({
      path: "maxOutputTokens",
      message: "Enter a positive whole number of tokens.",
    });
  } else if (values.maxOutputTokens > config.usageLimits.maxTokensPerRequest) {
    issues.push({
      path: "maxOutputTokens",
      message: "This task allows more tokens than the maximum per request.",
    });
  }

  return issues;
}

function fallbackIssues(
  config: AiConfiguration,
  capability: AiCapability,
  fallbackModelId: string,
  primary: AiModel | undefined,
): AiFieldIssue[] {
  const fallback = modelById(config, fallbackModelId);
  if (!fallback) {
    return [{ path: "fallbackModelId", message: "Select a fallback model from the sample catalog." }];
  }
  if (primary && fallback.id === primary.id) {
    return [{
      path: "fallbackModelId",
      message: "Choose a fallback model that is different from the assigned model.",
    }];
  }
  const provider = providerById(config, fallback.providerId);
  if (!provider || provider.status !== "Active") {
    return [{
      path: "fallbackModelId",
      message: "The fallback model must belong to an enabled provider.",
    }];
  }
  if (fallback.status !== "Active") {
    return [{ path: "fallbackModelId", message: "The fallback model must be enabled." }];
  }
  if (!fallback.capabilities.includes(capability)) {
    return [{
      path: "fallbackModelId",
      message: `The fallback model must support ${capability}.`,
    }];
  }
  return [];
}

export function usageLimitIssues(
  config: AiConfiguration,
  values: AiUsageLimitsFormValues,
): AiFieldIssue[] {
  const issues: AiFieldIssue[] = [];
  const highestTask = Math.max(...config.tasks.map((task) => task.maxOutputTokens));

  if (!wholeNumber(values.maxTokensPerRequest, 1, 200000)) {
    issues.push({
      path: "maxTokensPerRequest",
      message: "Enter a positive whole number of tokens per request.",
    });
  } else if (values.maxTokensPerRequest < highestTask) {
    issues.push({
      path: "maxTokensPerRequest",
      message: `Set the maximum per request to at least ${highestTask.toLocaleString("en-US")} so existing tasks stay within the limit.`,
    });
  }

  if (!wholeNumber(values.dailyUsageThreshold, 1, 100000000)) {
    issues.push({
      path: "dailyUsageThreshold",
      message: "Enter a positive daily usage threshold.",
    });
  }

  if (!wholeNumber(values.monthlyUsageThreshold, 1, 1000000000)) {
    issues.push({
      path: "monthlyUsageThreshold",
      message: "Enter a positive monthly usage threshold.",
    });
  } else if (
    wholeNumber(values.dailyUsageThreshold, 1, 100000000) &&
    values.dailyUsageThreshold > values.monthlyUsageThreshold
  ) {
    issues.push({
      path: "monthlyUsageThreshold",
      message: "The monthly threshold must be at least the daily threshold.",
    });
  }

  if (!wholeNumber(values.warningThresholdPercent, 1, 100)) {
    issues.push({
      path: "warningThresholdPercent",
      message: "Enter a warning threshold from 1 to 100 percent.",
    });
  }

  return issues;
}

function wholeNumber(value: number, min: number, max: number) {
  return Number.isInteger(value) && value >= min && value <= max;
}

export function toProviderFormValues(provider: AiProvider): AiProviderFormValues {
  return {
    name: provider.name,
    identifier: provider.identifier,
    description: provider.description,
    providerType: provider.providerType,
    defaultModelId: provider.defaultModelId ?? "",
    status: provider.status,
  };
}

export function toModelFormValues(model: AiModel): AiModelFormValues {
  return {
    providerId: model.providerId,
    name: model.name,
    description: model.description,
    capabilities: [...model.capabilities],
    status: model.status,
  };
}

export function toTaskFormValues(task: AiTaskConfig): AiTaskFormValues {
  return {
    description: task.description,
    providerId: task.providerId,
    modelId: task.modelId,
    fallbackModelId: task.fallbackModelId ?? "",
    status: task.status,
    maxOutputTokens: task.maxOutputTokens,
  };
}
