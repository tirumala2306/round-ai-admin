"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AuditDetailDrawer } from "@/components/audit-logs/audit-detail-drawer";
import { AuditFiltersBar } from "@/components/audit-logs/audit-filters";
import { AuditHeader } from "@/components/audit-logs/audit-header";
import { AuditKpiCards } from "@/components/audit-logs/audit-kpi-cards";
import { AuditLogsTable } from "@/components/audit-logs/audit-logs-table";
import { auditLogsModule } from "@/features/audit-logs";
import { filterAuditLogs, paginateAuditLogs, sortAuditLogs } from "@/features/audit-logs/query";
import { listAuditLogs, summarizeAuditLogs } from "@/features/audit-logs/selectors";
import type { AuditFilters } from "@/features/audit-logs/types";
import { useOrganizationDirectory } from "@/features/organizations/demo-store";

const emptyFilters: AuditFilters = {
  search: "",
  organizationId: "All",
  module: "All",
  actionType: "All",
  status: "All",
  range: "all",
};

export function AuditLogsScreen() {
  const directory = useOrganizationDirectory();
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const logs = useMemo(() => listAuditLogs(directory), [directory]);
  const filtered = useMemo(() => filterAuditLogs(logs, filters), [logs, filters]);
  const sorted = useMemo(() => sortAuditLogs(filtered, sortDirection), [filtered, sortDirection]);
  const summary = useMemo(() => summarizeAuditLogs(filtered), [filtered]);
  const pagination = paginateAuditLogs(sorted, page);
  const selected = logs.find((log) => log.id === selectedId);
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(emptyFilters);

  function updateFilters(next: AuditFilters) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <AuditHeader />
      <AuditKpiCards summary={summary} />
      <section className="min-w-0 rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4">
          <AuditFiltersBar
            filters={filters}
            organizations={directory.organizations}
            filtersActive={filtersActive}
            onChange={updateFilters}
            onClear={() => updateFilters(emptyFilters)}
          />
        </div>
        {sorted.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <h2 className="text-base font-semibold tracking-tight">{auditLogsModule.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {auditLogsModule.emptyDescription}
            </p>
            {filtersActive ? (
              <Button type="button" variant="outline" className="mt-4" onClick={() => updateFilters(emptyFilters)}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <AuditLogsTable
            logs={pagination.items}
            sortDirection={sortDirection}
            onSort={() => {
              setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
              setPage(1);
            }}
            onView={setSelectedId}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0 ? "0 events" : `Showing ${pagination.rangeStart}–${pagination.rangeEnd} of ${sorted.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <p className="min-w-16 text-center text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.pageCount}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={pagination.page >= pagination.pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
      <AuditDetailDrawer
        log={selected}
        open={selectedId !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(undefined);
          }
        }}
      />
    </div>
  );
}
