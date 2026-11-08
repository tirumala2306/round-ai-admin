"use client";

import { ChartEmpty, MonitoringBars, MonitoringLineChart } from "@/components/ai-monitoring/monitoring-charts";
import { monitoringChartColors } from "@/features/ai-monitoring/palette";
import { formatCount, formatMoney } from "@/features/ai-monitoring/format";
import type { MonitoringBucket, MonitoringSummary, NamedUsage, OrganizationUsage } from "@/features/ai-monitoring/types";

export function AiCostSection({
  summary,
  buckets,
  models,
  organizations,
}: {
  summary: MonitoringSummary;
  buckets: MonitoringBucket[];
  models: NamedUsage[];
  organizations: OrganizationUsage[];
}) {
  const stats = [
    { label: "Total estimated cost", value: formatMoney(summary.estimatedCost) },
    { label: "Input tokens", value: formatCount(summary.inputTokens) },
    { label: "Output tokens", value: formatCount(summary.outputTokens) },
    { label: "Average cost per request", value: formatMoney(summary.averageCost) },
  ];

  return (
    <section className="grid gap-3">
      <div>
        <h2 className="text-base font-semibold tracking-tight">AI cost metrics</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Estimated in US dollars from sample token rates. These figures are not provider invoices and are not billing
          records.
        </p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Cost trend</h3>
          <p className="mt-1 mb-3 text-sm text-muted-foreground">
            Estimated cost in US dollars for each interval in this view.
          </p>
          {summary.total === 0 ? (
            <ChartEmpty />
          ) : (
            <MonitoringLineChart
              money
              ariaLabel={`Estimated sample cost ${formatMoney(summary.estimatedCost)}.`}
              labels={buckets.map((bucket) => bucket.label)}
              series={[
                {
                  id: "cost",
                  label: "Estimated cost",
                  color: monitoringChartColors.successful,
                  values: buckets.map((bucket) => bucket.estimatedCost),
                },
              ]}
            />
          )}
        </div>
        <div className="grid gap-3">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Cost by model</h3>
            <MonitoringBars
              valueLabel={(value) => formatMoney(value)}
              items={models.map((model) => ({
                id: model.id,
                label: model.label,
                value: model.estimatedCost,
                detail: `${formatCount(model.requests)} requests · ${formatCount(model.tokens)} tokens`,
              }))}
            />
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Cost by organization</h3>
            <MonitoringBars
              valueLabel={(value) => formatMoney(value)}
              items={organizations.map((organization) => ({
                id: organization.organizationId,
                label: organization.name,
                value: organization.estimatedCost,
                detail: `${formatCount(organization.requests)} requests · ${formatCount(organization.tokens)} tokens`,
              }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
