"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { DeactivateTeamDialog } from "@/components/teams/deactivate-team-dialog";
import { TeamFormDialog } from "@/components/teams/team-form-dialog";
import { TeamMemberDialog } from "@/components/teams/team-member-dialog";
import { TeamMoveDialog } from "@/components/teams/team-move-dialog";
import { Button } from "@/components/ui/button";
import {
  releaseOrganizationWrite,
  removeTeamMember,
  setTeamStatus,
  updateTeam,
  useIsClient,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { listTeamMembers } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import type {
  TeamFormValues,
  TeamMembership,
} from "@/features/organizations/types";

type PendingMove = {
  organizationName: string;
  values: TeamFormValues;
  members: TeamMembership[];
};

export function TeamDetail({ teamId }: { teamId: string }) {
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const team = directory.teams.find((item) => item.id === teamId);
  const organization = directory.organizations.find(
    (item) => item.id === team?.organizationId,
  );
  const department = directory.departments.find(
    (item) => item.id === team?.departmentId,
  );
  const members = team ? listTeamMembers(directory, team.id) : [];
  const [editing, setEditing] = useState(false);
  const [managing, setManaging] = useState(false);
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false);
  const [pendingMove, setPendingMove] = useState<PendingMove | undefined>();

  if (!isClient) {
    return <TeamDetailSkeleton />;
  }

  if (!team) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-base font-semibold tracking-tight">
          Clinical team not in this sample
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This address does not match a clinical team in the current sample
          list. Refreshing the page restores the original records.
        </p>
        <Button asChild className="mt-6">
          <Link href="/clinical-teams">Back to clinical teams</Link>
        </Button>
      </section>
    );
  }

  const activeMembers = members.filter((member) => member.status === "Active").length;

  function saveTeam(values: TeamFormValues) {
    const result = updateTeam(teamId, values);
    if (!result.ok) {
      if (result.reason === "incompatible") {
        setPendingMove({
          organizationName:
            directory.organizations.find(
              (item) => item.id === values.organizationId,
            )?.name ?? "the selected organization",
          values,
          members: result.members,
        });
      }
      return false;
    }
    releaseOrganizationWrite();
    setEditing(false);
    showOrganizationToast(`${values.name} was updated in this sample list.`);
    return true;
  }

  function confirmMove() {
    if (!pendingMove) {
      return;
    }
    const result = updateTeam(teamId, pendingMove.values, {
      removeIncompatibleMembers: true,
    });
    if (!result.ok) {
      showOrganizationToast("The team could not be moved.");
      return;
    }
    showOrganizationToast(
      `${pendingMove.values.name} was moved. ${result.removedMembers.length} member memberships were removed.`,
    );
    setPendingMove(undefined);
    setEditing(false);
  }

  function removeMember(userId: string) {
    const user = members.find((member) => member.id === userId);
    const removed = removeTeamMember(teamId, userId);
    showOrganizationToast(
      removed && user
        ? `${user.name} was removed from ${team?.name ?? "this team"}.`
        : "That membership is no longer in this sample list.",
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/clinical-teams"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Clinical Teams
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{team.name}</h2>
            <OrganizationStatusBadge status={team.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {department ? department.name : "Unknown department"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setManaging(true)}>
            Manage members
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (team.status === "Active") {
                setConfirmingDeactivation(true);
                return;
              }
              setTeamStatus(teamId, "Active");
              showOrganizationToast(`${team.name} is active in this sample list.`);
            }}
          >
            {team.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              releaseOrganizationWrite();
              setEditing(true);
            }}
          >
            Edit clinical team
          </Button>
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <span>Organization</span>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span>Departments</span>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span>Clinical Teams</span>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span>Users</span>
      </p>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Team overview</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <DetailItem label="Team" value={team.name} />
            <div>
              <dt className="text-xs text-muted-foreground">Organization</dt>
              <dd className="mt-1">
                {organization ? (
                  <Link
                    href={`/organizations/${organization.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {organization.name}
                  </Link>
                ) : (
                  "Unknown organization"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Department</dt>
              <dd className="mt-1">
                {department ? (
                  <Link
                    href={`/departments/${department.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {department.name}
                  </Link>
                ) : (
                  "Unknown department"
                )}
              </dd>
            </div>
            <DetailItem label="Status" value={team.status} />
            <DetailItem label="Created" value={formatCreatedDate(team.createdAt)} />
            <DetailItem label="Updated" value={formatCreatedDate(team.updatedAt)} />
            <div className="sm:col-span-2">
              <DetailItem
                label="Description"
                value={team.description || "Not provided"}
              />
            </div>
          </dl>
        </article>
        <section
          aria-label="Team statistics"
          className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
        >
          <Stat label="Total members" value={members.length} />
          <Stat label="Active members" value={activeMembers} />
          <Stat label="Inactive members" value={members.length - activeMembers} />
        </section>
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Team members</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Removing a person takes them off this team only. Their user record
            and organization stay the same.
          </p>
        </div>
        {members.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">
            This sample team has no members yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    User name
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Organization
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {member.name}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.role}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {organization?.name ?? "Unknown organization"}
                    </td>
                    <td className="px-4 py-3">
                      <OrganizationStatusBadge status={member.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <TeamFormDialog
        open={editing}
        mode="edit"
        team={team}
        directory={directory}
        onOpenChange={setEditing}
        onSubmit={saveTeam}
      />
      <TeamMemberDialog
        open={managing}
        team={team}
        directory={directory}
        onOpenChange={setManaging}
      />
      <TeamMoveDialog
        open={pendingMove !== undefined}
        teamName={team.name}
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
        open={confirmingDeactivation}
        teamName={team.name}
        onOpenChange={setConfirmingDeactivation}
        onConfirm={() => {
          setTeamStatus(teamId, "Inactive");
          setConfirmingDeactivation(false);
          showOrganizationToast(`${team.name} is inactive in this sample list.`);
        }}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
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

function TeamDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading clinical team</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
