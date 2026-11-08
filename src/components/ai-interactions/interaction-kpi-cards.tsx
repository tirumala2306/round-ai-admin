import type { LucideIcon } from "lucide-react";
import { CircleCheck, Flag, MessageSquare, ThumbsDown, ThumbsUp, Timer } from "lucide-react";
import { formatLatency, formatPercent } from "@/features/ai-monitoring/format";
import type { InteractionSummary } from "@/features/ai-interactions/types";
import { cn } from "@/lib/utils";

export function InteractionKpiCards({ summary }: { summary: InteractionSummary }) {
  const share = (count: number) =>
    summary.total === 0 ? "No interactions in this view" : `${formatPercent((count / summary.total) * 100)} of this view`;

  const cards: {
    id: string;
    label: string;
    value: string;
    raw: number;
    support: string;
    icon: LucideIcon;
    tone: "default" | "alert";
  }[] = [
    {
      id: "total",
      label: "Total Interactions",
      value: String(summary.total),
      raw: summary.total,
      support: "In the current filters",
      icon: MessageSquare,
      tone: "default",
    },
    {
      id: "successful",
      label: "Successful Responses",
      value: String(summary.successful),
      raw: summary.successful,
      support: share(summary.successful),
      icon: CircleCheck,
      tone: "default",
    },
    {
      id: "flagged",
      label: "Flagged Interactions",
      value: String(summary.flagged),
      raw: summary.flagged,
      support: summary.total === 0 ? share(0) : `${share(summary.flagged)} · pending or under review`,
      icon: Flag,
      tone: "alert",
    },
    {
      id: "positive",
      label: "Positive Feedback",
      value: String(summary.positive),
      raw: summary.positive,
      support: share(summary.positive),
      icon: ThumbsUp,
      tone: "default",
    },
    {
      id: "negative",
      label: "Negative Feedback",
      value: String(summary.negative),
      raw: summary.negative,
      support: share(summary.negative),
      icon: ThumbsDown,
      tone: "default",
    },
    {
      id: "latency",
      label: "Average Response Time",
      value: formatLatency(summary.averageResponseTimeMs),
      raw: summary.averageResponseTimeMs,
      support: "Mean latency in this view",
      icon: Timer,
      tone: "default",
    },
  ];

  return (
    <section aria-label="Sample interaction metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.id}
            data-kpi={card.id}
            data-value={card.raw}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">{card.label}</h2>
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md",
                  card.tone === "alert" ? "bg-warning/15 text-warning" : "bg-brand/25 text-primary",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.support}</p>
          </article>
        );
      })}
    </section>
  );
}
