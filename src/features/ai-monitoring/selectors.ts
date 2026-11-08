import {
  aiFeatures,
  aiModels,
  estimateRequestCost,
  featureLabel,
  modelById,
  monitoringAsOfMs,
  rangeDurationMs,
} from "@/features/ai-monitoring/catalog";
import { formatBucketDay } from "@/features/ai-monitoring/format";
import type { OrganizationDirectory } from "@/features/organizations/types";
import type {
  AiRequestRecord,
  MonitoringBucket,
  MonitoringErrorRecord,
  MonitoringFilters,
  MonitoringSummary,
  MonitoringView,
  NamedUsage,
  OrganizationUsage,
} from "@/features/ai-monitoring/types";

function windowFor(range: MonitoringFilters["range"], ending: number) {
  const duration = rangeDurationMs(range);
  return {
    start: ending - duration,
    end: ending,
    previousStart: ending - duration * 2,
    previousEnd: ending - duration,
  };
}

function inSpan(record: AiRequestRecord, start: number, end: number) {
  const time = Date.parse(record.occurredAt);
  return time >= start && time < end;
}

function matchesDimensions(
  record: AiRequestRecord,
  filters: MonitoringFilters,
  options: { organization?: boolean; feature?: boolean; model?: boolean },
) {
  if (options.organization && filters.organizationId !== "all" && record.organizationId !== filters.organizationId) {
    return false;
  }
  if (options.feature && filters.featureId !== "all" && record.featureId !== filters.featureId) {
    return false;
  }
  if (options.model && filters.modelId !== "all" && record.modelId !== filters.modelId) {
    return false;
  }
  return true;
}

function percentile(values: number[], ratio: number) {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(ratio * sorted.length) - 1));
  return sorted[index];
}

function summarize(records: AiRequestRecord[]): MonitoringSummary {
  const total = records.length;
  const successful = records.filter((record) => record.status === "Success").length;
  const failed = total - successful;
  const latency = records.reduce((sum, record) => sum + record.latencyMs, 0);
  const inputTokens = records.reduce((sum, record) => sum + record.inputTokens, 0);
  const outputTokens = records.reduce((sum, record) => sum + record.outputTokens, 0);
  const estimatedCost = records.reduce((sum, record) => sum + estimateRequestCost(record), 0);
  const models = new Set(records.map((record) => record.modelId));

  return {
    total,
    successful,
    failed,
    averageLatencyMs: total === 0 ? 0 : latency / total,
    p95LatencyMs: percentile(
      records.map((record) => record.latencyMs),
      0.95,
    ),
    successRate: total === 0 ? 0 : (successful / total) * 100,
    failureRate: total === 0 ? 0 : (failed / total) * 100,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost,
    averageCost: total === 0 ? 0 : estimatedCost / total,
    activeModels: models.size,
  };
}

function bucketLabel(start: number, step: number, range: MonitoringFilters["range"]) {
  const stamp = range === "24h" ? start : start + step / 2;
  const iso = new Date(stamp).toISOString();
  if (range === "24h") {
    return iso.slice(11, 16);
  }
  return formatBucketDay(iso);
}

function buildBuckets(records: AiRequestRecord[], filters: MonitoringFilters, start: number, end: number) {
  const duration = end - start;
  const count = filters.range === "24h" ? 24 : filters.range === "7d" ? 7 : 30;
  const step = duration / count;
  const buckets: MonitoringBucket[] = Array.from({ length: count }, (_, index) => {
    const bucketStart = start + step * index;
    return {
      label: bucketLabel(bucketStart, step, filters.range),
      total: 0,
      successful: 0,
      failed: 0,
      averageLatencyMs: 0,
      estimatedCost: 0,
    };
  });
  const latencySums = Array.from({ length: count }, () => 0);

  for (const record of records) {
    const time = Date.parse(record.occurredAt);
    const index = Math.min(count - 1, Math.max(0, Math.floor((time - start) / step)));
    const bucket = buckets[index];
    bucket.total += 1;
    if (record.status === "Success") {
      bucket.successful += 1;
    } else {
      bucket.failed += 1;
    }
    latencySums[index] += record.latencyMs;
    bucket.estimatedCost += estimateRequestCost(record);
  }

  return buckets.map((bucket, index) => ({
    ...bucket,
    averageLatencyMs: bucket.total === 0 ? 0 : latencySums[index] / bucket.total,
  }));
}

function organizationName(directory: OrganizationDirectory, organizationId: string) {
  return directory.organizations.find((organization) => organization.id === organizationId)?.name ?? "Unknown organization";
}

function organizationUsage(records: AiRequestRecord[], directory: OrganizationDirectory): OrganizationUsage[] {
  const ids = new Set<string>([
    ...directory.organizations.map((organization) => organization.id),
    ...records.map((record) => record.organizationId),
  ]);
  const total = records.length;
  const rows = [...ids].map((organizationId) => {
    const matching = records.filter((record) => record.organizationId === organizationId);
    const tokens = matching.reduce((sum, record) => sum + record.inputTokens + record.outputTokens, 0);
    const requests = matching.length;
    return {
      organizationId,
      name: organizationName(directory, organizationId),
      requests,
      tokens,
      percentage: total === 0 ? 0 : (requests / total) * 100,
      estimatedCost: matching.reduce((sum, record) => sum + estimateRequestCost(record), 0),
    };
  });

  return rows.sort((left, right) => right.requests - left.requests || left.name.localeCompare(right.name));
}

function namedUsage(
  records: AiRequestRecord[],
  groups: { id: string; label: string }[],
  readId: (record: AiRequestRecord) => string,
): NamedUsage[] {
  const total = records.length;
  return groups.map((group) => {
    const matching = records.filter((record) => readId(record) === group.id);
    const requests = matching.length;
    return {
      id: group.id,
      label: group.label,
      requests,
      tokens: matching.reduce((sum, record) => sum + record.inputTokens + record.outputTokens, 0),
      percentage: total === 0 ? 0 : (requests / total) * 100,
      estimatedCost: matching.reduce((sum, record) => sum + estimateRequestCost(record), 0),
    };
  });
}

function toError(record: AiRequestRecord, directory: OrganizationDirectory): MonitoringErrorRecord | undefined {
  if (!record.errorId || !record.errorType || !record.errorStatus || !record.errorDetail) {
    return undefined;
  }
  return {
    errorId: record.errorId,
    requestId: record.id,
    occurredAt: record.occurredAt,
    organizationId: record.organizationId,
    organizationName: organizationName(directory, record.organizationId),
    featureId: record.featureId,
    featureLabel: featureLabel(record.featureId),
    modelId: record.modelId,
    modelName: modelById(record.modelId)?.name ?? record.modelId,
    provider: record.provider,
    errorType: record.errorType,
    errorStatus: record.errorStatus,
    errorDetail: record.errorDetail,
    latencyMs: record.latencyMs,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    estimatedCost: estimateRequestCost(record),
  };
}

export function buildMonitoringView(
  records: AiRequestRecord[],
  directory: OrganizationDirectory,
  filters: MonitoringFilters,
): MonitoringView {
  const span = windowFor(filters.range, monitoringAsOfMs);
  const current = records.filter(
    (record) =>
      inSpan(record, span.start, span.end) &&
      matchesDimensions(record, filters, { organization: true, feature: true, model: true }),
  );
  const previous = records.filter(
    (record) =>
      inSpan(record, span.previousStart, span.previousEnd) &&
      matchesDimensions(record, filters, { organization: true, feature: true, model: true }),
  );
  const organizationChartRecords = records.filter(
    (record) =>
      inSpan(record, span.start, span.end) &&
      matchesDimensions(record, filters, { feature: true, model: true }),
  );
  const featureChartRecords = records.filter(
    (record) =>
      inSpan(record, span.start, span.end) &&
      matchesDimensions(record, filters, { organization: true, model: true }),
  );
  const modelChartRecords = records.filter(
    (record) =>
      inSpan(record, span.start, span.end) &&
      matchesDimensions(record, filters, { organization: true, feature: true }),
  );

  const errors = current
    .map((record) => toError(record, directory))
    .filter((record): record is MonitoringErrorRecord => record !== undefined)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  const modelGroups = aiModels.map((model) => ({ id: model.id, label: model.name }));

  return {
    summary: summarize(current),
    previous: summarize(previous),
    buckets: buildBuckets(current, filters, span.start, span.end),
    organizations: withSelectedOrganization(
      organizationUsage(organizationChartRecords, directory),
      filters.organizationId,
      directory,
    ),
    features: namedUsage(featureChartRecords, aiFeatures, (record) => record.featureId),
    models: namedUsage(modelChartRecords, modelGroups, (record) => record.modelId),
    costByModel: namedUsage(current, modelGroups, (record) => record.modelId).filter((row) => row.requests > 0),
    costByOrganization: organizationUsage(current, directory).filter((row) => row.requests > 0),
    errors,
  };
}

function withSelectedOrganization(
  rows: OrganizationUsage[],
  organizationId: string,
  directory: OrganizationDirectory,
) {
  const visible = rows.filter((row) => row.requests > 0 || row.organizationId === organizationId);
  if (organizationId === "all" || visible.some((row) => row.organizationId === organizationId)) {
    return visible;
  }
  return [
    ...visible,
    {
      organizationId,
      name: organizationName(directory, organizationId),
      requests: 0,
      tokens: 0,
      percentage: 0,
      estimatedCost: 0,
    },
  ];
}
