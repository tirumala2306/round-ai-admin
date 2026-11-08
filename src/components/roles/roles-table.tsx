"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCreatedDate } from "@/features/organizations/format";
import type { RoleListItem } from "@/features/roles/types";
import type { RoleSortKey, SortDirection } from "@/features/roles/query";

const columns: { key: RoleSortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Role name" },
  { key: "description", label: "Description" },
  { key: "type", label: "Role type" },
  { key: "users", label: "Assigned users", align: "right" },
  { key: "permissions", label: "Permissions", align: "right" },
  { key: "updatedAt", label: "Last updated" },
];

export function RolesTable({
  roles,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: {
  roles: RoleListItem[];
  sortKey: RoleSortKey;
  sortDirection: SortDirection;
  onSort: (key: RoleSortKey) => void;
  onEdit: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-sm">
        <caption className="sr-only">
          Sample roles. Assigned users and permission counts come from the shared directory.
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
          {roles.map((role) => (
            <tr key={role.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-medium">
                <Link
                  href={`/roles/${role.id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {role.name}
                </Link>
              </th>
              <td className="max-w-72 px-4 py-3 text-muted-foreground">{role.description}</td>
              <td className="px-4 py-3">
                <RoleTypeBadge type={role.type} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{role.assignedUserCount}</td>
              <td className="px-4 py-3 text-right tabular-nums">{role.permissionCount}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatCreatedDate(role.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/roles/${role.id}`} aria-label={`View details for ${role.name}`}>
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${role.name}`}
                    onClick={() => onEdit(role)}
                  >
                    <Pencil />
                  </Button>
                  {role.type === "Custom" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${role.name}`}
                      onClick={() => onDelete(role)}
                    >
                      <Trash2 />
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RoleTypeBadge({ type }: { type: RoleListItem["type"] }) {
  if (type === "System") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-brand/30 font-normal text-foreground"
      >
        System
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="font-normal">
      Custom
    </Badge>
  );
}
