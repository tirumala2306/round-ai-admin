"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import { RolesTable } from "@/components/roles/roles-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addRole,
  deleteRole,
  releaseOrganizationWrite,
  updateRole,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { roleTypes, type RoleType } from "@/features/organizations/types";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import {
  filterRoles,
  paginateRoles,
  sortRoles,
  type RoleSortKey,
  type SortDirection,
} from "@/features/roles/query";
import { listRoles, summarizeRoles } from "@/features/roles/selectors";
import type { RoleFormValues, RoleListItem } from "@/features/roles/types";

export function RolesScreen() {
  const directory = useOrganizationDirectory();
  const roles = useMemo(() => listRoles(directory), [directory]);
  const summary = useMemo(() => summarizeRoles(directory), [directory]);
  const [search, setSearch] = useState("");
  const [roleType, setRoleType] = useState<RoleType | "All">("All");
  const [sortKey, setSortKey] = useState<RoleSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [pendingDelete, setPendingDelete] = useState<RoleListItem | undefined>();
  const listRef = useRef<HTMLElement>(null);
  const editing = directory.roles.find((role) => role.id === editingId);
  const filtered = useMemo(
    () => filterRoles(roles, search, roleType),
    [roles, search, roleType],
  );
  const sorted = useMemo(
    () => sortRoles(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );
  const pagination = paginateRoles(sorted, page);
  const filtersActive = search.trim().length > 0 || roleType !== "All";

  function changeSort(key: RoleSortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function openAdd() {
    releaseOrganizationWrite();
    setEditingId(undefined);
    setDialogOpen(true);
  }

  function openEdit(role: RoleListItem) {
    releaseOrganizationWrite();
    setEditingId(role.id);
    setDialogOpen(true);
  }

  function saveRole(values: RoleFormValues) {
    if (editing) {
      const result = updateRole(editing.id, values);
      if (!result.ok) {
        showOrganizationToast(
          result.reason === "duplicate"
            ? "A role with this name is already in the sample list."
            : result.reason === "protected"
              ? "System role names stay fixed."
              : "The role could not be updated.",
        );
        return false;
      }
      showOrganizationToast(`${values.name.trim()} was updated in this sample list.`);
      releaseOrganizationWrite();
      setDialogOpen(false);
      return true;
    }

    const created = addRole(values);
    if (!created) {
      showOrganizationToast("The role could not be created.");
      return false;
    }
    showOrganizationToast(`${created.name} was added to this sample list.`);
    setSearch("");
    setRoleType("All");
    setPage(1);
    setSortKey("updatedAt");
    setSortDirection("desc");
    releaseOrganizationWrite();
    setDialogOpen(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ block: "start" });
    });
    return true;
  }

  function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    const result = deleteRole(pendingDelete.id);
    if (!result.ok) {
      showOrganizationToast(
        result.reason === "assigned"
          ? `${pendingDelete.name} still has assigned users, so it was not deleted.`
          : result.reason === "system"
            ? "System roles stay in the sample list."
            : "The role could not be deleted.",
      );
      return;
    }
    showOrganizationToast(`${pendingDelete.name} was removed from this sample list.`);
    setPendingDelete(undefined);
  }

  function clearFilters() {
    setSearch("");
    setRoleType("All");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage access levels and permissions across RoundsAI.
        </p>
        <Button type="button" onClick={openAdd} className="shrink-0">
          <Plus />
          Create role
        </Button>
      </div>
      <section aria-label="Sample role counts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Total roles" value={summary.total} />
        <CountCard label="System roles" value={summary.system} />
        <CountCard label="Custom roles" value={summary.custom} />
        <CountCard label="Total assigned users" value={summary.assignedUsers} />
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="role-search">Search roles</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="role-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by role name"
              className="bg-card pl-8"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="role-type-filter">Role type</Label>
          <Select
            value={roleType}
            onValueChange={(value) => {
              setRoleType(value as RoleType | "All");
              setPage(1);
            }}
          >
            <SelectTrigger id="role-type-filter" className="w-full bg-card">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="All">All</SelectItem>
              {roleTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <section
        ref={listRef}
        className="scroll-mt-20 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        {roles.length === 0 ? (
          <EmptyCopy
            title="No roles yet"
            description="Create a custom role in this browser session. Refreshing the page restores the original sample set."
          />
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold tracking-tight">No roles match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              No sample role matches these filters. Clear the filters to see the full list.
            </p>
            {filtersActive ? (
              <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <RolesTable
            roles={pagination.items}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={changeSort}
            onEdit={openEdit}
            onDelete={setPendingDelete}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0
              ? "0 roles"
              : `Showing ${pagination.rangeStart}–${pagination.rangeEnd} of ${sorted.length}`}
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
      <RoleFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "add"}
        role={editing}
        directory={directory}
        onOpenChange={setDialogOpen}
        onSubmit={saveRole}
      />
      <DeleteRoleDialog
        open={pendingDelete !== undefined}
        roleName={pendingDelete?.name}
        assignedUsers={pendingDelete?.assignedUserCount ?? 0}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(undefined);
          }
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function EmptyCopy({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Sample total</p>
    </article>
  );
}
