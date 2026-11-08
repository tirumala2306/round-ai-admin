"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { formatCreatedDate } from "@/features/organizations/format";
import type {
  OrganizationSortKey,
  SortDirection,
} from "@/features/organizations/query";
import type { OrganizationSummary } from "@/features/organizations/types";

const columns: { key: OrganizationSortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Organization name" },
  { key: "type", label: "Organization type" },
  { key: "departments", label: "Departments", align: "right" },
  { key: "teams", label: "Clinical teams", align: "right" },
  { key: "users", label: "Total users", align: "right" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created date" },
];

export function OrganizationsTable({
  organizations,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onToggleStatus,
}: {
  organizations: OrganizationSummary[];
  sortKey: OrganizationSortKey;
  sortDirection: SortDirection;
  onSort: (key: OrganizationSortKey) => void;
  onEdit: (organization: OrganizationSummary) => void;
  onToggleStatus: (organization: OrganizationSummary) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] text-sm">
        <caption className="sr-only">
          Fictional sample organizations. Sortable by column.
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
          {organizations.map((organization) => {
            const nextStatus =
              organization.status === "Active" ? "Deactivate" : "Activate";

            return (
              <tr
                key={organization.id}
                className="border-b border-border last:border-0"
              >
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  <Link
                    href={`/organizations/${organization.id}`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {organization.name}
                  </Link>
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {organization.type}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {organization.departmentCount}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {organization.teamCount}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {organization.userCount}
                </td>
                <td className="px-4 py-3">
                  <OrganizationStatusBadge status={organization.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCreatedDate(organization.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        href={`/organizations/${organization.id}`}
                        aria-label={`View details for ${organization.name}`}
                      >
                        <Eye />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${organization.name}`}
                      onClick={() => onEdit(organization)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-24"
                      onClick={() => onToggleStatus(organization)}
                    >
                      {nextStatus}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
