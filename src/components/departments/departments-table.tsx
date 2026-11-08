"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import type {
  DepartmentSortKey,
  SortDirection,
} from "@/features/departments/query";
import { formatCreatedDate } from "@/features/organizations/format";
import type { DepartmentListItem } from "@/features/organizations/types";

const columns: { key: DepartmentSortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Department name" },
  { key: "organization", label: "Organization" },
  { key: "teams", label: "Clinical teams", align: "right" },
  { key: "users", label: "Total users", align: "right" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created date" },
];

export function DepartmentsTable({
  departments,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onToggleStatus,
}: {
  departments: DepartmentListItem[];
  sortKey: DepartmentSortKey;
  sortDirection: SortDirection;
  onSort: (key: DepartmentSortKey) => void;
  onEdit: (department: DepartmentListItem) => void;
  onToggleStatus: (department: DepartmentListItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <caption className="sr-only">
          Sample departments. Counts come from related clinical teams and users.
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
          {departments.map((department) => {
            const nextStatus =
              department.status === "Active" ? "Deactivate" : "Activate";

            return (
              <tr key={department.id} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  <Link
                    href={`/departments/${department.id}`}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    {department.name}
                  </Link>
                </th>
                <td className="px-4 py-3 text-muted-foreground">
                  {department.organizationName}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {department.teamCount}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {department.userCount}
                </td>
                <td className="px-4 py-3">
                  <OrganizationStatusBadge status={department.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatCreatedDate(department.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        href={`/departments/${department.id}`}
                        aria-label={`View details for ${department.name}`}
                      >
                        <Eye />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${department.name}`}
                      onClick={() => onEdit(department)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-24"
                      onClick={() => onToggleStatus(department)}
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
