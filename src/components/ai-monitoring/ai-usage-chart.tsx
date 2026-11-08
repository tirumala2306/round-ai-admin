"use client";

import { ChartEmpty, MonitoringBars, MonitoringLineChart } from "@/components/ai-monitoring/monitoring-charts";
import { monitoringChartColors } from "@/features/ai-monitoring/palette";
import { formatCount, formatPercent } from "@/features/ai-monitoring/format";
import type { AiFeatureId, MonitoringBucket, NamedUsage } from "@/features/ai-monitoring/types";

export function AiUsageChart({ buckets, total }: { buckets: MonitoringBucket[]; total: number }) {
  return (
    <section className="rounded-lg border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-4">
        <h2 className="text-base font-semibold tracking-tight">Request volume</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample AI requests over the selected period. Totals, successes, and failures come from the same records.
        </p>
      </header>
      <div className="p-4">
        {total === 0 ? (
          <ChartEmpty />
        ) : (
          <MonitoringLineChart
            ariaLabel={`Sample request volume. ${formatCount(total)} requests in this view.`}
            labels={buckets.map((bucket) => bucket.label)}
            series={[
              {
                id: "total",
                label: "Total requests",
                color: monitoringChartColors.total,
                values: buckets.map((bucket) => bucket.total),
              },
              {
                id: "successful",
                label: "Successful requests",
                color: monitoringChartColors.successful,
                values: buckets.map((bucket) => bucket.successful),
              },
              {
                id: "failed",
                label: "Failed requests",
                color: monitoringChartColors.failed,
                values: buckets.map((bucket) => bucket.failed),
              },
            ]}
          />
        )}
      </div>
    </section>
  );
}

export function FeatureUsageChart({
  features,
  selectedId,
  onSelect,
}: {
  features: NamedUsage[];
  selectedId: AiFeatureId | "all";
  onSelect: (featureId: AiFeatureId) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight">AI feature usage</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sample clinical workflow categories. Select a bar to filter the rest of this view.
          </p>
        </div>
        {selectedId !== "all" ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => onSelect(selectedId)}
          >
            Show all features
          </button>
        ) : null}
      </div>
      <MonitoringBars
        selectedId={selectedId === "all" ? undefined : selectedId}
        onSelect={(id) => onSelect(id as AiFeatureId)}
        valueLabel={formatCount}
        items={features.map((feature) => ({
          id: feature.id,
          label: feature.label,
          value: feature.requests,
          detail: `${formatPercent(feature.percentage)} of requests in this chart · ${formatCount(feature.tokens)} tokens`,
        }))}
      />
    </section>
  );
}
