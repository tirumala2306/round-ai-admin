"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DeactivateUserDialog } from "@/components/users/deactivate-user-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UsersTable } from "@/components/users/users-table";
import { UserTeamsDialog } from "@/components/users/user-teams-dialog";
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
  addUser,
  releaseOrganizationWrite,
  setUserStatus,
  updateUser,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { listUsers } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import {
  organizationStatuses,
  type RecordStatus,
  type UserFormValues,
  type UserListItem,
} from "@/features/organizations/types";
import {
  filterUsers,
  paginateUsers,
  sortUsers,
  type SortDirection,
  type UserSortKey,
} from "@/features/users/query";

export function UsersScreen() {
  const directory = useOrganizationDirectory();
  const users = useMemo(() => listUsers(directory), [directory]);
  const organizations = useMemo(
    () =>
      [...directory.organizations].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    [directory.organizations],
  );
  const [search, setSearch] = useState("");
  const [organizationId, setOrganizationId] = useState<string | "All">("All");
  const [departmentId, setDepartmentId] = useState<string | "All">("All");
  const [teamId, setTeamId] = useState<string | "All">("All");
  const [role, setRole] = useState<string | "All">("All");
  const [status, setStatus] = useState<RecordStatus | "All">("All");
  const [sortKey, setSortKey] = useState<UserSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [managingId, setManagingId] = useState<string | undefined>();
  const [pendingDeactivation, setPendingDeactivation] = useState<
    UserListItem | undefined
  >();
  const listRef = useRef<HTMLElement>(null);
  const editing = directory.users.find((user) => user.id === editingId);
  const managing = directory.users.find((user) => user.id === managingId);

  const departmentOptions = useMemo(
    () =>
      directory.departments
        .filter(
          (department) =>
            organizationId === "All" ||
            department.organizationId === organizationId,
        )
        .map((department) => ({
          id: department.id,
          label:
            organizationId === "All"
              ? `${department.name} — ${
                  organizations.find(
                    (organization) =>
                      organization.id === department.organizationId,
                  )?.name ?? "Unknown organization"
                }`
              : department.name,
        }))
        .sort((left, right) => left.label.localeCompare(right.label)),
    [directory.departments, organizationId, organizations],
  );
  const teamOptions = useMemo(
    () =>
      directory.teams
        .filter((team) => {
          if (organizationId !== "All" && team.organizationId !== organizationId) {
            return false;
          }
          if (departmentId !== "All" && team.departmentId !== departmentId) {
            return false;
          }
          return true;
        })
        .map((team) => {
          const department = directory.departments.find(
            (item) => item.id === team.departmentId,
          );
          const organization = organizations.find(
            (item) => item.id === team.organizationId,
          );
          const label =
            departmentId === "All"
              ? `${team.name} — ${department?.name ?? "Unknown department"}${
                  organizationId === "All"
                    ? `, ${organization?.name ?? "Unknown organization"}`
                    : ""
                }`
              : team.name;
          return { id: team.id, label };
        })
        .sort((left, right) => left.label.localeCompare(right.label)),
    [departmentId, directory.departments, directory.teams, organizationId, organizations],
  );
  const filtered = useMemo(
    () =>
      filterUsers(
        users,
        search,
        organizationId,
        departmentId,
        teamId,
        role,
        status,
      ),
    [users, search, organizationId, departmentId, teamId, role, status],
  );
  const sorted = useMemo(
    () => sortUsers(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );
  const pagination = paginateUsers(sorted, page);
  const counts = countByStatus(users);
  const filtersActive =
    search.trim().length > 0 ||
    organizationId !== "All" ||
    departmentId !== "All" ||
    teamId !== "All" ||
    role !== "All" ||
    status !== "All";

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeOrganization(value: string | "All") {
    setOrganizationId(value);
    setDepartmentId("All");
    setTeamId("All");
    setPage(1);
  }

  function changeDepartment(value: string | "All") {
    setDepartmentId(value);
    setTeamId("All");
    setPage(1);
  }

  function changeSort(key: UserSortKey) {
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

  function openEdit(user: UserListItem) {
    releaseOrganizationWrite();
    setEditingId(user.id);
    setDialogOpen(true);
  }

  function saveUser(values: UserFormValues) {
    if (editing) {
      const result = updateUser(editing.id, values);
      if (!result.ok) {
        showOrganizationToast(
          result.reason === "duplicate"
            ? "A user with this email is already in the sample list."
            : "The user could not be updated.",
        );
        return false;
      }
      const removed = result.removedTeams.length;
      showOrganizationToast(
        removed === 0
          ? `${values.name} was updated in this sample list.`
          : `${values.name} was updated. ${removed} team membership${removed === 1 ? "" : "s"} from the previous organization ${removed === 1 ? "was" : "were"} removed.`,
      );
      releaseOrganizationWrite();
      setDialogOpen(false);
      return true;
    }

    const created = addUser(values);
    if (!created) {
      showOrganizationToast("The user could not be added.");
      return false;
    }
    showOrganizationToast(`${values.name} was added to this sample list.`);
    setSearch("");
    setOrganizationId("All");
    setDepartmentId("All");
    setTeamId("All");
    setRole("All");
    setStatus("All");
    setPage(1);
    setSortKey("createdAt");
    setSortDirection("desc");
    releaseOrganizationWrite();
    setDialogOpen(false);
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ block: "start" });
    });
    return true;
  }

  function toggleStatus(user: UserListItem) {
    if (user.status === "Active") {
      setPendingDeactivation(user);
      return;
    }
    setUserStatus(user.id, "Active");
    showOrganizationToast(`${user.name} is active in this sample list.`);
  }

  function confirmDeactivation() {
    if (!pendingDeactivation) {
      return;
    }
    setUserStatus(pendingDeactivation.id, "Inactive");
    showOrganizationToast(
      `${pendingDeactivation.name} is inactive in this sample list.`,
    );
    setPendingDeactivation(undefined);
  }

  function clearFilters() {
    setSearch("");
    setOrganizationId("All");
    setDepartmentId("All");
    setTeamId("All");
    setRole("All");
    setStatus("All");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage physicians, residents, and clinical staff across organizations.
        </p>
        <Button type="button" onClick={openAdd} className="shrink-0">
          <Plus />
          Add user
        </Button>
      </div>
      <section aria-label="Sample user counts" className="grid gap-3 sm:grid-cols-3">
        <CountCard label="Users" value={users.length} />
        <CountCard label="Active" value={counts.Active} />
        <CountCard label="Inactive" value={counts.Inactive} />
      </section>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="user-search">Search users</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="user-search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search by name or email"
              className="bg-card pl-8"
            />
          </div>
        </div>
        <FilterSelect
          id="user-organization-filter"
          label="Organization"
          value={organizationId}
          onChange={changeOrganization}
          options={organizations.map((organization) => ({
            id: organization.id,
            label: organization.name,
          }))}
        />
        <FilterSelect
          id="user-department-filter"
          label="Department"
          value={departmentId}
          onChange={changeDepartment}
          options={departmentOptions}
        />
        <FilterSelect
          id="user-team-filter"
          label="Clinical team"
          value={teamId}
          onChange={(value) => {
            setTeamId(value);
            setPage(1);
          }}
          options={teamOptions}
        />
        <FilterSelect
          id="user-role-filter"
          label="Role"
          value={role}
          onChange={(value) => {
            setRole(value);
            setPage(1);
          }}
          options={[...directory.roles]
            .sort((left, right) => left.name.localeCompare(right.name))
            .map((item) => ({ id: item.name, label: item.name }))}
        />
        <FilterSelect
          id="user-status-filter"
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value as RecordStatus | "All");
            setPage(1);
          }}
          options={organizationStatuses.map((item) => ({ id: item, label: item }))}
        />
      </div>
      <section
        ref={listRef}
        className="scroll-mt-20 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        {users.length === 0 ? (
          <EmptyCopy
            title="No users yet"
            description="Add a user to this browser session. Refreshing the page restores the original sample set."
          />
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold tracking-tight">No users match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              No sample user matches these filters. Clear the filters to see the
              full list.
            </p>
            {filtersActive ? (
              <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <UsersTable
            users={pagination.items}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={changeSort}
            onEdit={openEdit}
            onManageTeams={(user) => setManagingId(user.id)}
            onToggleStatus={toggleStatus}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0
              ? "0 users"
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
      <UserFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "add"}
        user={editing}
        directory={directory}
        onOpenChange={setDialogOpen}
        onSubmit={saveUser}
      />
      <UserTeamsDialog
        open={managing !== undefined}
        user={managing}
        directory={directory}
        onOpenChange={(open) => {
          if (!open) {
            setManagingId(undefined);
          }
        }}
      />
      <DeactivateUserDialog
        open={pendingDeactivation !== undefined}
        userName={pendingDeactivation?.name}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeactivation(undefined);
          }
        }}
        onConfirm={confirmDeactivation}
      />
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full bg-card">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="All">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

function countByStatus(users: UserListItem[]) {
  return users.reduce(
    (counts, user) => {
      counts[user.status] += 1;
      return counts;
    },
    { Active: 0, Inactive: 0 },
  );
}
