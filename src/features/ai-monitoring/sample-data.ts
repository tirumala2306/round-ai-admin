import { aiErrorTypeOptions, aiModels, monitoringAsOfMs } from "@/features/ai-monitoring/catalog";
import type {
  AiErrorStatus,
  AiFeatureId,
  AiModelId,
  AiRequestRecord,
} from "@/features/ai-monitoring/types";

const dayMs = 24 * 60 * 60 * 1000;

const organizationWeights: { id: string; weight: number }[] = [
  { id: "meridian", weight: 32 },
  { id: "cedarline", weight: 24 },
  { id: "alder", weight: 20 },
  { id: "harborlight", weight: 14 },
  { id: "westford", weight: 10 },
];

const featureWeights: { id: AiFeatureId; weight: number }[] = [
  { id: "patient-summaries", weight: 28 },
  { id: "rounds-preparation", weight: 22 },
  { id: "clinical-notes", weight: 24 },
  { id: "clinical-considerations", weight: 14 },
  { id: "evidence-retrieval", weight: 12 },
];

const errorDetails = {
  "API Timeout":
    "The sample provider did not answer before the demo timeout. This record contains no clinical content.",
  "Rate Limit Exceeded":
    "The sample provider returned a rate-limit response for this demo request.",
  "Invalid Response":
    "The sample model returned a payload that failed the demo response check.",
  "Provider Unavailable":
    "The sample provider reported itself unavailable for this demo request.",
  "Request Validation Failed":
    "The demo request was rejected before it reached a model. No patient data is included.",
} as const;

function createRandom(seed: number) {
  let state = seed >>> 0;
  return function random() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pickWeighted<T extends string>(random: () => number, items: { id: T; weight: number }[]) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * total;
  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.id;
    }
  }
  return items[items.length - 1].id;
}

function preferredModel(featureId: AiFeatureId, random: () => number): AiModelId {
  const roll = random();
  if (featureId === "evidence-retrieval") {
    return roll < 0.78 ? "rounds-evidence-v1" : "rounds-clinical-v1";
  }
  if (featureId === "clinical-notes" || featureId === "rounds-preparation") {
    return roll < 0.72 ? "rounds-notes-v1" : "rounds-clinical-v1";
  }
  return roll < 0.8 ? "rounds-clinical-v1" : "rounds-notes-v1";
}

function tokenRange(featureId: AiFeatureId) {
  if (featureId === "evidence-retrieval") {
    return { input: [8000, 16000], output: [1200, 3600] };
  }
  if (featureId === "clinical-notes") {
    return { input: [5000, 11000], output: [1800, 4200] };
  }
  if (featureId === "patient-summaries") {
    return { input: [6000, 14000], output: [1400, 3800] };
  }
  return { input: [4000, 9000], output: [900, 2600] };
}

function between(random: () => number, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

function buildSampleRequests() {
  const random = createRandom(20261105);
  const windowStart = monitoringAsOfMs - 30 * dayMs;
  const requests: AiRequestRecord[] = [];
  let sequence = 0;
  let errorSequence = 0;

  for (let day = 0; day < 30; day += 1) {
    const dayStart = windowStart + day * dayMs;
    const volume = 32 + Math.floor(random() * 14);
    for (let index = 0; index < volume; index += 1) {
      sequence += 1;
      const featureId = pickWeighted(random, featureWeights);
      const modelId = preferredModel(featureId, random);
      const model = aiModels.find((item) => item.id === modelId);
      const tokens = tokenRange(featureId);
      const failed = sequence % 13 === 0;
      const latencyMs = failed
        ? between(random, 2800, 9000)
        : between(random, 640, 2400);
      const inputTokens = between(random, tokens.input[0], tokens.input[1]);
      const outputTokens = failed ? between(random, 0, 400) : between(random, tokens.output[0], tokens.output[1]);
      const occurredAt = new Date(dayStart + Math.floor(random() * dayMs)).toISOString();
      const record: AiRequestRecord = {
        id: `AI-${String(sequence).padStart(4, "0")}`,
        organizationId: pickWeighted(random, organizationWeights),
        featureId,
        modelId,
        provider: model?.provider ?? "Sample provider",
        occurredAt,
        latencyMs,
        inputTokens,
        outputTokens,
        status: failed ? "Failed" : "Success",
      };

      if (failed) {
        errorSequence += 1;
        const errorType = aiErrorTypeOptions[errorSequence % aiErrorTypeOptions.length];
        const errorStatus: AiErrorStatus =
          errorSequence % 5 === 0 ? "Open" : errorSequence % 5 === 1 ? "Acknowledged" : "Resolved";
        record.errorId = `ERR-${String(errorSequence).padStart(4, "0")}`;
        record.errorType = errorType;
        record.errorStatus = errorStatus;
        record.errorDetail = errorDetails[errorType];
      }

      requests.push(record);
    }
  }

  return requests;
}

/** Synthetic monitoring snapshot. Refreshing the page restores this same set. */
export const sampleAiRequests = buildSampleRequests();

export const aiMonitoringSampleNotice =
  "These monitoring records are synthetic demo data for this browser session. They are not connected to an AI provider, do not include patient information, and are not saved to the RoundsAI backend. Estimated costs are sample calculations, not invoices. Refreshing the page restores this snapshot.";
