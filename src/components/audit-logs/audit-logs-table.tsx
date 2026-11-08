"use client";

import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditModuleBadge, AuditStatusBadge } from "@/components/audit-logs/audit-badges";
import { formatMonitoringStamp } from "@/features/ai-monitoring/format";
import type { AuditLogListItem } from "@/features/audit-logs/types";

export function AuditLogsTable({
  logs,
  sortDirection,
  onSort,
  onView,
}: {
  logs: AuditLogListItem[];
  sortDirection: "asc" | "desc";
  onSort: () => void;
  onView: (eventId: string) => void;
}) {
  const SortIcon = sortDirection === "asc" ? ChevronUp : ChevronDown;

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[1080px] text-sm">
        <caption className="sr-only">
          Synthetic audit events. Actors and organizations come from the shared directory. Records are read-only.
        </caption>
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">
              Event
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Actor
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Module
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Organization
            </th>
            <th scope="col" aria-sort={sortDirection === "asc" ? "ascending" : "descending"} className="px-4 py-2.5">
              <button
                type="button"
                onClick={onSort}
                className="inline-flex items-center gap-1 font-medium hover:text-foreground"
              >
                Date & Time
                <SortIcon className="size-3.5" aria-hidden="true" />
              </button>
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/40"
              onClick={() => onView(log.id)}
            >
              <th scope="row" className="px-4 py-3 text-left font-medium">
                <button type="button" className="text-left hover:underline" onClick={() => onView(log.id)}>
                  {log.eventName}
                </button>
                <p className="mt-0.5 text-xs font-normal text-muted-foreground">{log.actionType}</p>
              </th>
              <td className="px-4 py-3">
                <p className="whitespace-nowrap">{log.displayActorName}</p>
                <p className="text-xs text-muted-foreground">{log.displayActorEmail}</p>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <AuditModuleBadge module={log.module} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{log.displayOrganizationName}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatMonitoringStamp(log.timestamp)}
              </td>
              <td className="px-4 py-3">
                <AuditStatusBadge status={log.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => onView(log.id)}>
                    <Eye />
                    View details
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
