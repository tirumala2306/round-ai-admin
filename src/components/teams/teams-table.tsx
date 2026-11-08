"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil, Users } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { formatCreatedDate } from "@/features/organizations/format";
import type { TeamListItem } from "@/features/organizations/types";
import type { SortDirection, TeamSortKey } from "@/features/teams/query";

const columns: { key: TeamSortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Team name" },
  { key: "organization", label: "Organization" },
  { key: "department", label: "Department" },
  { key: "members", label: "Team members", align: "right" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created date" },
];

export function TeamsTable({
  teams,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onManageMembers,
  onToggleStatus,
}: {
  teams: TeamListItem[];
  sortKey: TeamSortKey;
  sortDirection: SortDirection;
  onSort: (key: TeamSortKey) => void;
  onEdit: (team: TeamListItem) => void;
  onManageMembers: (team: TeamListItem) => void;
  onToggleStatus: (team: TeamListItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-sm">
        <caption className="sr-only">
          Sample clinical teams. Member counts come from team memberships.
        </caption>
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            {columns.map((column) => {
              const active = sortKey === column.key;
              const Icon = !active
                ? ChevronsUpDown
                : sortDirection === "asc"
                  ? ChevronUp
                  : ChevronDown;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={
                    column.align === "right" ? "px-4 py-2.5 text-right" : "px-4 py-2.5"
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSort(column.key)}
                    className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                  >
                    {column.label}
                    <Icon
                      className={active ? "size-3.5" : "size-3.5 opacity-40"}
                      aria-hidden="true"
                    />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-medium">
                <Link
                  href={`/clinical-teams/${team.id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {team.name}
                </Link>
              </th>
              <td className="px-4 py-3 text-muted-foreground">
                {team.organizationName}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {team.departmentName}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {team.memberCount}
              </td>
              <td className="px-4 py-3">
                <OrganizationStatusBadge status={team.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatCreatedDate(team.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-nowrap items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                      href={`/clinical-teams/${team.id}`}
                      aria-label={`View details for ${team.name}`}
                    >
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${team.name}`}
                    onClick={() => onEdit(team)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Manage members for ${team.name}`}
                    onClick={() => onManageMembers(team)}
                  >
                    <Users />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-24"
                    onClick={() => onToggleStatus(team)}
                  >
                    {team.status === "Active" ? "Deactivate" : "Activate"}
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
