import type { LucideIcon } from "lucide-react";
import { CircleCheck, CircleX, ScrollText, Users } from "lucide-react";
import { formatPercent } from "@/features/ai-monitoring/format";
import type { AuditSummary } from "@/features/audit-logs/types";
import { cn } from "@/lib/utils";

export function AuditKpiCards({ summary }: { summary: AuditSummary }) {
  const share = (count: number) =>
    summary.total === 0 ? "No events in this view" : `${formatPercent((count / summary.total) * 100)} of this view`;

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
      label: "Total Events",
      value: String(summary.total),
      raw: summary.total,
      support: "In the current filters",
      icon: ScrollText,
      tone: "default",
    },
    {
      id: "successful",
      label: "Successful Actions",
      value: String(summary.successful),
      raw: summary.successful,
      support: share(summary.successful),
      icon: CircleCheck,
      tone: "default",
    },
    {
      id: "failed",
      label: "Failed Actions",
      value: String(summary.failed),
      raw: summary.failed,
      support: share(summary.failed),
      icon: CircleX,
      tone: "alert",
    },
    {
      id: "actors",
      label: "Unique Actors",
      value: String(summary.uniqueActors),
      raw: summary.uniqueActors,
      support: "Distinct actors in this view",
      icon: Users,
      tone: "default",
    },
  ];

  return (
    <section aria-label="Sample audit metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
