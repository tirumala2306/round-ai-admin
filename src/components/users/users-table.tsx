"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil, Users } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { formatCreatedDate } from "@/features/organizations/format";
import type { UserListItem } from "@/features/organizations/types";
import type { SortDirection, UserSortKey } from "@/features/users/query";

const columns: { key: UserSortKey; label: string }[] = [
  { key: "name", label: "User name" },
  { key: "email", label: "Email" },
  { key: "organization", label: "Organization" },
  { key: "teams", label: "Clinical teams" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created date" },
];

export function UsersTable({
  users,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onManageTeams,
  onToggleStatus,
}: {
  users: UserListItem[];
  sortKey: UserSortKey;
  sortDirection: SortDirection;
  onSort: (key: UserSortKey) => void;
  onEdit: (user: UserListItem) => void;
  onManageTeams: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] text-sm">
        <caption className="sr-only">
          Sample users. Clinical teams come from memberships in the same organization.
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
                  className="px-4 py-2.5"
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
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-medium">
                <Link
                  href={`/users/${user.id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {user.name}
                </Link>
              </th>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {user.organizationName}
              </td>
              <td className="max-w-56 px-4 py-3 text-muted-foreground">
                {user.teamNames.length === 0 ? "None" : user.teamNames.join(", ")}
              </td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">
                <OrganizationStatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatCreatedDate(user.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-nowrap items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                      href={`/users/${user.id}`}
                      aria-label={`View details for ${user.name}`}
                    >
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${user.name}`}
                    onClick={() => onEdit(user)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Manage teams for ${user.name}`}
                    onClick={() => onManageTeams(user)}
                  >
                    <Users />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-24"
                    onClick={() => onToggleStatus(user)}
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
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
