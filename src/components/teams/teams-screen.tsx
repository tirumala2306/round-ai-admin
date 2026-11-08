"use client";

import { useMemo, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { DeactivateTeamDialog } from "@/components/teams/deactivate-team-dialog";
import { TeamFormDialog } from "@/components/teams/team-form-dialog";
import { TeamMemberDialog } from "@/components/teams/team-member-dialog";
import { TeamMoveDialog } from "@/components/teams/team-move-dialog";
import { TeamsTable } from "@/components/teams/teams-table";
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
  addTeam,
  releaseOrganizationWrite,
  setTeamStatus,
  updateTeam,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { listTeams } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import { organizationStatuses } from "@/features/organizations/types";
import type {
  ClinicalTeam,
  RecordStatus,
  TeamFormValues,
  TeamListItem,
  TeamMembership,
} from "@/features/organizations/types";
import {
  filterTeams,
  paginateTeams,
  sortTeams,
  type SortDirection,
  type TeamSortKey,
} from "@/features/teams/query";

type PendingMove = {
  teamId: string;
  teamName: string;
  organizationName: string;
  values: TeamFormValues;
  members: TeamMembership[];
};

export function TeamsScreen() {
  const directory = useOrganizationDirectory();
  const teams = useMemo(() => listTeams(directory), [directory]);
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
  const [status, setStatus] = useState<RecordStatus | "All">("All");
  const [sortKey, setSortKey] = useState<TeamSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicalTeam | undefined>();
  const [managing, setManaging] = useState<ClinicalTeam | undefined>();
  const [pendingDeactivation, setPendingDeactivation] = useState<
    TeamListItem | undefined
  >();
  const [pendingMove, setPendingMove] = useState<PendingMove | undefined>();
  const listRef = useRef<HTMLElement>(null);

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
  const filtered = useMemo(
    () => filterTeams(teams, search, organizationId, departmentId, status),
    [teams, search, organizationId, departmentId, status],
  );
  const sorted = useMemo(
    () => sortTeams(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );
  const pagination = paginateTeams(sorted, page);
  const counts = countByStatus(teams);
  const filtersActive =
    search.trim().length > 0 ||
    organizationId !== "All" ||
    departmentId !== "All" ||
    status !== "All";

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeOrganization(value: string | "All") {
    setOrganizationId(value);
    if (value !== "All" && departmentId !== "All") {
      const department = directory.departments.find(
        (item) => item.id === departmentId,
      );
      if (department?.organizationId !== value) {
        setDepartmentId("All");
      }
    }
    setPage(1);
  }

  function changeDepartment(value: string | "All") {
    setDepartmentId(value);
    setPage(1);
  }

  function changeStatus(value: RecordStatus | "All") {
    setStatus(value);
    setPage(1);
  }

  function changeSort(key: TeamSortKey) {
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
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(team: TeamListItem) {
    releaseOrganizationWrite();
    setEditing(team);
    setDialogOpen(true);
  }

  function saveTeam(values: TeamFormValues) {
    if (editing) {
      const result = updateTeam(editing.id, values);
      if (!result.ok) {
        if (result.reason === "incompatible") {
          setPendingMove({
            teamId: editing.id,
            teamName: editing.name,
            organizationName:
              directory.organizations.find(
                (organization) => organization.id === values.organizationId,
              )?.name ?? "the selected organization",
            values,
            members: result.members,
          });
        }
        return false;
      }
      showOrganizationToast(`${values.name} was updated in this sample list.`);
      releaseOrganizationWrite();
      setDialogOpen(false);
      return true;
    }

    const created = addTeam(values);
    if (!created) {
      return false;
    }
    showOrganizationToast(`${values.name} was added to this sample list.`);
    setSearch("");
    setOrganizationId("All");
    setDepartmentId("All");
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

  function confirmMove() {
    if (!pendingMove) {
      return;
    }

    const result = updateTeam(pendingMove.teamId, pendingMove.values, {
      removeIncompatibleMembers: true,
    });
    if (!result.ok) {
      showOrganizationToast("The team could not be moved.");
      return;
    }
    const removed = result.removedMembers.length;
    showOrganizationToast(
      removed === 1
        ? `${pendingMove.values.name} was moved. 1 member was removed from the team.`
        : `${pendingMove.values.name} was moved. ${removed} members were removed from the team.`,
    );
    setPendingMove(undefined);
    setDialogOpen(false);
  }

  function toggleStatus(team: TeamListItem) {
    if (team.status === "Active") {
      setPendingDeactivation(team);
      return;
    }
    setTeamStatus(team.id, "Active");
    showOrganizationToast(`${team.name} is active in this sample list.`);
  }

  function confirmDeactivation() {
    if (!pendingDeactivation) {
      return;
    }
    setTeamStatus(pendingDeactivation.id, "Inactive");
    showOrganizationToast(
      `${pendingDeactivation.name} is inactive in this sample list.`,
    );
    setPendingDeactivation(undefined);
  }

  function clearFilters() {
    setSearch("");
    setOrganizationId("All");
    setDepartmentId("All");
    setStatus("All");
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage clinical teams and their members across hospital departments.
        </p>
        <Button type="button" onClick={openAdd} className="shrink-0">
          <Plus />
          Add clinical team
        </Button>
      </div>
      <section aria-label="Sample team counts" className="grid gap-3 sm:grid-cols-3">
        <CountCard label="Clinical teams" value={teams.length} />
        <CountCard label="Active" value={counts.Active} />
        <CountCard label="Inactive" value={counts.Inactive} />
      </section>
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="grid gap-1.5 lg:col-span-1">
          <Label htmlFor="team-search">Search teams</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="team-search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search by name"
              className="bg-card pl-8"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="team-organization-filter">Organization</Label>
          <Select value={organizationId} onValueChange={changeOrganization}>
            <SelectTrigger id="team-organization-filter" className="w-full bg-card">
              <SelectValue placeholder="All organizations" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="All">All</SelectItem>
              {organizations.map((organization) => (
                <SelectItem key={organization.id} value={organization.id}>
                  {organization.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="team-department-filter">Department</Label>
          <Select value={departmentId} onValueChange={changeDepartment}>
            <SelectTrigger id="team-department-filter" className="w-full bg-card">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="All">All</SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="team-status-filter">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => changeStatus(value as RecordStatus | "All")}
          >
            <SelectTrigger id="team-status-filter" className="w-full bg-card">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="All">All</SelectItem>
              {organizationStatuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
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
        {teams.length === 0 ? (
          <EmptyCopy
            title="No clinical teams yet"
            description="Add a team to this browser session. Refreshing the page restores the original sample set."
          />
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold tracking-tight">
              No clinical teams match
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              No sample team matches these filters. Clear the filters to see
              the full list.
            </p>
            {filtersActive ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <TeamsTable
            teams={pagination.items}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={changeSort}
            onEdit={openEdit}
            onManageMembers={setManaging}
            onToggleStatus={toggleStatus}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0
              ? "0 clinical teams"
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
      <TeamFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "add"}
        team={editing}
        directory={directory}
        onOpenChange={setDialogOpen}
        onSubmit={saveTeam}
      />
      <TeamMemberDialog
        open={managing !== undefined}
        team={managing}
        directory={directory}
        onOpenChange={(open) => {
          if (!open) {
            setManaging(undefined);
          }
        }}
      />
      <TeamMoveDialog
        open={pendingMove !== undefined}
        teamName={pendingMove?.teamName ?? "this team"}
        organizationName={pendingMove?.organizationName ?? "the selected organization"}
        members={pendingMove?.members ?? []}
        onOpenChange={(open) => {
          if (!open) {
            setPendingMove(undefined);
          }
        }}
        onConfirm={confirmMove}
      />
      <DeactivateTeamDialog
        open={pendingDeactivation !== undefined}
        teamName={pendingDeactivation?.name}
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

function EmptyCopy({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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

function countByStatus(teams: TeamListItem[]) {
  return teams.reduce(
    (counts, team) => {
      counts[team.status] += 1;
      return counts;
    },
    { Active: 0, Inactive: 0 },
  );
}
