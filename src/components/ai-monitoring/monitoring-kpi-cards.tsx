import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Coins,
  Minus,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { comparePeriods, formatCount, formatLatency, formatMoney } from "@/features/ai-monitoring/format";
import type { MonitoringSummary } from "@/features/ai-monitoring/types";
import { cn } from "@/lib/utils";

export function MonitoringKpiCards({
  summary,
  previous,
}: {
  summary: MonitoringSummary;
  previous: MonitoringSummary;
}) {
  const cards = [
    {
      id: "total",
      label: "Total AI Requests",
      raw: summary.total,
      value: formatCount(summary.total),
      support: "Sample requests in this view",
      icon: Activity,
      trend: comparePeriods(summary.total, previous.total),
      higherIsBetter: true,
    },
    {
      id: "successful",
      label: "Successful Requests",
      raw: summary.successful,
      value: formatCount(summary.successful),
      support: "Completed without a sample error",
      icon: CircleCheck,
      trend: comparePeriods(summary.successful, previous.successful),
      higherIsBetter: true,
    },
    {
      id: "failed",
      label: "Failed Requests",
      raw: summary.failed,
      value: formatCount(summary.failed),
      support: "Sample failures in this view",
      icon: CircleX,
      trend: comparePeriods(summary.failed, previous.failed),
      higherIsBetter: false,
    },
    {
      id: "latency",
      label: "Average Response Time",
      raw: summary.averageLatencyMs,
      value: formatLatency(summary.averageLatencyMs),
      support: "Mean latency, including failures",
      icon: Timer,
      trend: comparePeriods(summary.averageLatencyMs, previous.averageLatencyMs),
      higherIsBetter: false,
    },
    {
      id: "tokens",
      label: "Total Tokens Used",
      raw: summary.totalTokens,
      value: formatCount(summary.totalTokens),
      support: "Input and output tokens",
      icon: Coins,
      trend: comparePeriods(summary.totalTokens, previous.totalTokens),
      higherIsBetter: true,
    },
    {
      id: "cost",
      label: "Estimated AI Cost",
      raw: summary.estimatedCost,
      value: formatMoney(summary.estimatedCost),
      support: "Sample USD estimate, not an invoice",
      icon: CircleDollarSign,
      trend: comparePeriods(summary.estimatedCost, previous.estimatedCost),
      higherIsBetter: false,
    },
  ];

  return (
    <section aria-label="Sample AI metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <KpiCard key={card.id} {...card} />
      ))}
    </section>
  );
}

function KpiCard({
  id,
  label,
  raw,
  value,
  support,
  icon: Icon,
  trend,
  higherIsBetter,
}: {
  id: string;
  label: string;
  raw: number;
  value: string;
  support: string;
  icon: LucideIcon;
  trend: ReturnType<typeof comparePeriods>;
  higherIsBetter: boolean;
}) {
  const positive =
    (higherIsBetter && trend.direction === "up") || (!higherIsBetter && trend.direction === "down");
  const negative =
    (higherIsBetter && trend.direction === "down") || (!higherIsBetter && trend.direction === "up");
  const TrendIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;

  return (
    <article data-kpi={id} data-value={raw} className="flex h-full flex-col rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-md",
            id === "failed" ? "bg-destructive/10 text-destructive" : "bg-brand/25 text-primary",
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums" data-kpi={id}>
        {value}
      </p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-xs font-medium",
          positive && "text-success",
          negative && "text-destructive",
          !positive && !negative && "text-muted-foreground",
        )}
      >
        <TrendIcon className="size-3.5" aria-hidden="true" />
        {trend.text}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{support}</p>
    </article>
  );
}
