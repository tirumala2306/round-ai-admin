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
  ClinicalTeam,
  OrganizationDirectory,
} from "@/features/organizations/types";

export function TeamMemberDialog({
  open,
  team,
  directory,
  onOpenChange,
}: {
  open: boolean;
  team?: ClinicalTeam;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const organization = directory.organizations.find(
    (item) => item.id === team?.organizationId,
  );
  const candidates = useMemo(() => {
    if (!team) {
      return [];
    }

    const query = search.trim().toLowerCase();
    return directory.users
      .filter((user) => user.organizationId === team.organizationId)
      .filter((user) => {
        if (query.length === 0) {
          return true;
        }
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [directory.users, search, team]);

  function changeMembership(userId: string, member: boolean) {
    if (!team) {
      return;
    }

    const user = directory.users.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    if (member) {
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
        `${user.name} belongs to another organization and cannot join this team.`,
      );
      return;
    }
    showOrganizationToast("That person is not in this sample list.");
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
            <DialogTitle>Manage members</DialogTitle>
            <DialogDescription>
              {team
                ? `People at ${organization?.name ?? "this organization"} can join ${team.name}. Membership does not change their organization.`
                : "Select a clinical team."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-1.5">
            <Label htmlFor="team-member-search">Search people</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="team-member-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="pl-8"
              />
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
            {candidates.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                {team
                  ? "No people at this organization match this search."
                  : "No team is selected."}
              </li>
            ) : (
              candidates.map((user) => {
                const member = team ? user.teamIds.includes(team.id) : false;
                return (
                  <li
                    key={user.id}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {user.role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <OrganizationStatusBadge status={user.status} />
                      {member ? (
                        <span className="text-xs text-muted-foreground">
                          Member
                        </span>
                      ) : null}
                      <Button
                        type="button"
                        variant={member ? "outline" : "default"}
                        size="sm"
                        onClick={() => changeMembership(user.id, member)}
                      >
                        {member ? "Remove" : "Add"}
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
