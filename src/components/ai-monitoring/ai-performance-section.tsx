"use client";

import { ChartEmpty, MonitoringBars, MonitoringLineChart } from "@/components/ai-monitoring/monitoring-charts";
import { monitoringChartColors } from "@/features/ai-monitoring/palette";
import { formatCount, formatLatency, formatPercent } from "@/features/ai-monitoring/format";
import type { AiModelId, MonitoringBucket, MonitoringSummary, NamedUsage } from "@/features/ai-monitoring/types";

export function AiPerformanceSection({
  summary,
  buckets,
  models,
  selectedModelId,
  onSelectModel,
}: {
  summary: MonitoringSummary;
  buckets: MonitoringBucket[];
  models: NamedUsage[];
  selectedModelId: AiModelId | "all";
  onSelectModel: (modelId: AiModelId) => void;
}) {
  const stats = [
    { label: "Average response time", value: formatLatency(summary.averageLatencyMs) },
    { label: "P95 response time", value: formatLatency(summary.p95LatencyMs) },
    { label: "Success rate", value: formatPercent(summary.successRate) },
    { label: "Failure rate", value: formatPercent(summary.failureRate) },
  ];

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight">AI performance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Latency and model mix for the current sample filters. Rates use the same request set as the summary cards.
          </p>
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-3 xl:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm xl:col-span-3">
          <h3 className="text-sm font-semibold">Response latency</h3>
          <p className="mt-1 mb-3 text-sm text-muted-foreground">Average sample latency in each interval.</p>
          {summary.total === 0 ? (
            <ChartEmpty />
          ) : (
            <MonitoringLineChart
              ariaLabel={`Average sample latency ${formatLatency(summary.averageLatencyMs)}.`}
              labels={buckets.map((bucket) => bucket.label)}
              formatValue={(value) => formatLatency(value)}
              series={[
                {
                  id: "latency",
                  label: "Average latency",
                  color: monitoringChartColors.total,
                  values: buckets.map((bucket) => bucket.averageLatencyMs),
                },
              ]}
            />
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm xl:col-span-2">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Requests per model</h3>
              <p className="mt-1 text-sm text-muted-foreground">Select a model to filter this view.</p>
            </div>
            {selectedModelId !== "all" ? (
              <button
                type="button"
                className="text-sm font-medium underline-offset-4 hover:underline"
                onClick={() => onSelectModel(selectedModelId)}
              >
                All models
              </button>
            ) : null}
          </div>
          <MonitoringBars
            selectedId={selectedModelId === "all" ? undefined : selectedModelId}
            onSelect={(id) => onSelectModel(id as AiModelId)}
            valueLabel={formatCount}
            items={models.map((model) => ({
              id: model.id,
              label: model.label,
              value: model.requests,
              detail: formatPercent(model.percentage),
            }))}
          />
        </div>
      </div>
    </section>
  );
}
