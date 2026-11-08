import type { AiErrorType, AiFeatureId, AiModelId, AiRequestRecord, AiTimeRange } from "@/features/ai-monitoring/types";

/** Fixed sample clock so server and browser render the same window. */
export const monitoringAsOf = "2026-11-05T17:00:00.000Z";

export const monitoringAsOfMs = Date.parse(monitoringAsOf);

export const monitoringCurrency = "USD";

export const aiTimeRangeOptions: { id: AiTimeRange; label: string }[] = [
  { id: "24h", label: "Last 24 Hours" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
];

export const aiFeatures: { id: AiFeatureId; label: string }[] = [
  { id: "patient-summaries", label: "Patient Summaries" },
  { id: "rounds-preparation", label: "Rounds Preparation" },
  { id: "clinical-notes", label: "Clinical Notes" },
  { id: "clinical-considerations", label: "Clinical Considerations" },
  { id: "evidence-retrieval", label: "Evidence Retrieval" },
];

/**
 * Sample model catalog. Token rates are demo prices, not a provider invoice.
 * Replace this list when a backend supplies real model configuration.
 */
export const aiModels: {
  id: AiModelId;
  name: string;
  provider: string;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}[] = [
  {
    id: "rounds-clinical-v1",
    name: "Rounds Clinical v1",
    provider: "Sample provider",
    inputUsdPerMillion: 15,
    outputUsdPerMillion: 60,
  },
  {
    id: "rounds-notes-v1",
    name: "Rounds Notes v1",
    provider: "Sample provider",
    inputUsdPerMillion: 8,
    outputUsdPerMillion: 32,
  },
  {
    id: "rounds-evidence-v1",
    name: "Rounds Evidence v1",
    provider: "Sample provider",
    inputUsdPerMillion: 12,
    outputUsdPerMillion: 48,
  },
];

export const aiErrorTypeOptions: AiErrorType[] = [
  "API Timeout",
  "Rate Limit Exceeded",
  "Invalid Response",
  "Provider Unavailable",
  "Request Validation Failed",
];

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;

export function rangeDurationMs(range: AiTimeRange) {
  if (range === "24h") {
    return 24 * hourMs;
  }
  if (range === "7d") {
    return 7 * dayMs;
  }
  return 30 * dayMs;
}

export function timeRangeLabel(range: AiTimeRange) {
  return aiTimeRangeOptions.find((option) => option.id === range)?.label ?? range;
}

export function featureLabel(featureId: AiFeatureId) {
  return aiFeatures.find((feature) => feature.id === featureId)?.label ?? featureId;
}

export function modelById(modelId: AiModelId) {
  return aiModels.find((model) => model.id === modelId);
}

export function estimateRequestCost(record: Pick<AiRequestRecord, "modelId" | "inputTokens" | "outputTokens">) {
  const model = modelById(record.modelId);
  if (!model) {
    return 0;
  }
  return (
    (record.inputTokens / 1_000_000) * model.inputUsdPerMillion +
    (record.outputTokens / 1_000_000) * model.outputUsdPerMillion
  );
}
