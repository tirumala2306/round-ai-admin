import { monitoringAsOfMs, rangeDurationMs } from "@/features/ai-monitoring/catalog";
import { paginateItems } from "@/features/ai-monitoring/query";
import type { AuditDateRange, AuditFilters, AuditLogListItem } from "@/features/audit-logs/types";

export const auditPageSize = 5;

export const auditDateRangeOptions: { id: AuditDateRange; label: string }[] = [
  { id: "all", label: "All sample dates" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

export function filterAuditLogs(logs: AuditLogListItem[], filters: AuditFilters) {
  const query = filters.search.trim().toLowerCase();
  const rangeStart = filters.range === "all" ? null : monitoringAsOfMs - rangeDurationMs(filters.range);

  return logs.filter((log) => {
    if (filters.organizationId !== "All" && log.organizationId !== filters.organizationId) {
      return false;
    }
    if (filters.module !== "All" && log.module !== filters.module) {
      return false;
    }
    if (filters.actionType !== "All" && log.actionType !== filters.actionType) {
      return false;
    }
    if (filters.status !== "All" && log.status !== filters.status) {
      return false;
    }
    if (rangeStart !== null && Date.parse(log.timestamp) < rangeStart) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }

    return [log.id, log.eventName, log.displayActorName, log.displayActorEmail, log.displayEntityName, log.entityId]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function sortAuditLogs(logs: AuditLogListItem[], direction: "asc" | "desc") {
  return [...logs].sort((left, right) => {
    const compared = left.timestamp.localeCompare(right.timestamp);
    return direction === "asc" ? compared : -compared;
  });
}

export function paginateAuditLogs(logs: AuditLogListItem[], page: number) {
  return paginateItems(logs, page, auditPageSize);
}
