"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addTeamMember,
  removeTeamMember,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import type {
  OrganizationDirectory,
  OrganizationUser,
} from "@/features/organizations/types";

export function UserTeamsDialog({
  open,
  user,
  directory,
  onOpenChange,
}: {
  open: boolean;
  user?: OrganizationUser;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const organization = directory.organizations.find(
    (item) => item.id === user?.organizationId,
  );
  const teams = useMemo(() => {
    if (!user) {
      return [];
    }
    const query = search.trim().toLowerCase();
    return directory.teams
      .filter((team) => team.organizationId === user.organizationId)
      .filter((team) => query.length === 0 || team.name.toLowerCase().includes(query))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((team) => ({
        ...team,
        departmentName:
          directory.departments.find((item) => item.id === team.departmentId)
            ?.name ?? "Unknown department",
      }));
  }, [directory.departments, directory.teams, search, user]);

  function changeMembership(teamId: string, assigned: boolean) {
    if (!user) {
      return;
    }
    const team = directory.teams.find((item) => item.id === teamId);
    if (!team) {
      return;
    }

    if (assigned) {
      const removed = removeTeamMember(team.id, user.id);
      showOrganizationToast(
        removed
          ? `${user.name} was removed from ${team.name}.`
          : `${user.name} is not a member of ${team.name}.`,
      );
      return;
    }

    const result = addTeamMember(team.id, user.id);
    if (result === "added") {
      showOrganizationToast(`${user.name} was added to ${team.name}.`);
      return;
    }
    if (result === "duplicate") {
      showOrganizationToast(`${user.name} is already a member of ${team.name}.`);
      return;
    }
    if (result === "wrong-organization") {
      showOrganizationToast(
        `${team.name} belongs to another organization and cannot be assigned.`,
      );
      return;
    }
    showOrganizationToast("That team is not in this sample list.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSearch("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <DialogHeader className="pr-8">
            <DialogTitle>Manage teams</DialogTitle>
            <DialogDescription>
              {user
                ? `Assign ${user.name} to teams at ${organization?.name ?? "this organization"}. Removing a team does not delete the person or the team.`
                : "Select a user."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-1.5">
            <Label htmlFor="user-team-search">Search teams</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="user-team-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by team name"
                className="pl-8"
              />
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {teams.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No teams at this organization match this search.
              </li>
            ) : (
              teams.map((team) => {
                const assigned = user ? user.teamIds.includes(team.id) : false;
                return (
                  <li
                    key={team.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.departmentName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrganizationStatusBadge status={team.status} />
                      {assigned ? (
                        <span className="text-xs text-muted-foreground">Assigned</span>
                      ) : null}
                      <Button
                        type="button"
                        variant={assigned ? "outline" : "default"}
                        size="sm"
                        onClick={() => changeMembership(team.id, assigned)}
                      >
                        {assigned ? "Remove" : "Add"}
                      </Button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
