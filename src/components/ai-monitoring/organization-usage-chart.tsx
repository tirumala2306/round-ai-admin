"use client";

import { MonitoringBars } from "@/components/ai-monitoring/monitoring-charts";
import { formatCount, formatPercent } from "@/features/ai-monitoring/format";
import type { OrganizationUsage } from "@/features/ai-monitoring/types";

export function OrganizationUsageChart({
  organizations,
  selectedId,
  onSelect,
}: {
  organizations: OrganizationUsage[];
  selectedId: string;
  onSelect: (organizationId: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Usage by organization</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Names come from the shared organization directory. Select a bar to filter this view.
          </p>
        </div>
        {selectedId !== "all" ? (
          <button
            type="button"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => onSelect(selectedId)}
          >
            All organizations
          </button>
        ) : null}
      </div>
      <MonitoringBars
        selectedId={selectedId === "all" ? undefined : selectedId}
        onSelect={onSelect}
        valueLabel={formatCount}
        items={organizations.map((organization) => ({
          id: organization.organizationId,
          label: organization.name,
          value: organization.requests,
          detail: `${formatPercent(organization.percentage)} of requests · ${formatCount(organization.tokens)} tokens`,
        }))}
      />
    </section>
  );
}
