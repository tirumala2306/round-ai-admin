"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { DeactivateUserDialog } from "@/components/users/deactivate-user-dialog";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UserTeamsDialog } from "@/components/users/user-teams-dialog";
import { Button } from "@/components/ui/button";
import {
  releaseOrganizationWrite,
  setUserStatus,
  updateUser,
  useIsClient,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { listUserTeams } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import type { UserFormValues } from "@/features/organizations/types";

export function UserDetail({ userId }: { userId: string }) {
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const user = directory.users.find((item) => item.id === userId);
  const organization = directory.organizations.find(
    (item) => item.id === user?.organizationId,
  );
  const memberships = user ? listUserTeams(directory, user.id) : [];
  const [editing, setEditing] = useState(false);
  const [managing, setManaging] = useState(false);
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false);

  if (!isClient) {
    return <UserDetailSkeleton />;
  }

  if (!user) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-base font-semibold tracking-tight">
          User not in this sample
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This address does not match a user in the current sample list.
          Refreshing the page restores the original records.
        </p>
        <Button asChild className="mt-6">
          <Link href="/users">Back to users</Link>
        </Button>
      </section>
    );
  }

  const activeMemberships = memberships.filter(
    (membership) => membership.status === "Active",
  ).length;

  function saveUser(values: UserFormValues) {
    const result = updateUser(userId, values);
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
    setEditing(false);
    return true;
  }

  function activate() {
    setUserStatus(userId, "Active");
    showOrganizationToast(`${user?.name ?? "This user"} is active in this sample list.`);
  }

  function confirmDeactivation() {
    setUserStatus(userId, "Inactive");
    showOrganizationToast(
      `${user?.name ?? "This user"} is inactive in this sample list.`,
    );
    setConfirmingDeactivation(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit px-0">
          <Link href="/users">
            <ArrowLeft />
            Users
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link href="/organizations" className="hover:text-foreground">
                Organizations
              </Link>
              <ChevronRight className="size-3" aria-hidden="true" />
              {organization ? (
                <Link
                  href={`/organizations/${organization.id}`}
                  className="hover:text-foreground"
                >
                  {organization.name}
                </Link>
              ) : (
                <span>Unknown organization</span>
              )}
              <ChevronRight className="size-3" aria-hidden="true" />
              <span>{user.name}</span>
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{user.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                releaseOrganizationWrite();
                setEditing(true);
              }}
            >
              Edit
            </Button>
            <Button type="button" variant="outline" onClick={() => setManaging(true)}>
              Manage teams
            </Button>
            {user.status === "Active" ? (
              <Button type="button" onClick={() => setConfirmingDeactivation(true)}>
                Deactivate
              </Button>
            ) : (
              <Button type="button" onClick={activate}>
                Activate
              </Button>
            )}
          </div>
        </div>
      </div>
      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">User profile</h3>
        </div>
        <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <ProfileItem label="Full name" value={user.name} />
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem label="Role" value={user.role} />
          <div>
            <dt className="text-xs text-muted-foreground">Organization</dt>
            <dd className="mt-1 text-sm">
              {organization ? (
                <Link
                  href={`/organizations/${organization.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {organization.name}
                </Link>
              ) : (
                "Unknown organization"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <OrganizationStatusBadge status={user.status} />
            </dd>
          </div>
          <ProfileItem label="Created date" value={formatCreatedDate(user.createdAt)} />
          <ProfileItem label="Updated date" value={formatCreatedDate(user.updatedAt)} />
        </dl>
      </section>
      <section aria-label="User statistics" className="grid gap-3 sm:grid-cols-2">
        <CountCard label="Total clinical teams" value={memberships.length} />
        <CountCard label="Active team memberships" value={activeMemberships} />
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Clinical team memberships</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Department comes from each team. A user does not have a separate
            department assignment.
          </p>
        </div>
        {memberships.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            This user is not assigned to a clinical team.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">
                Clinical teams assigned to {user.name}
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5">
                    Team name
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Organization
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Team status
                  </th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((membership) => (
                  <tr key={membership.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      <Link
                        href={`/clinical-teams/${membership.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {membership.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3">
                      <Link
                        href={`/departments/${membership.departmentId}`}
                        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {membership.departmentName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/organizations/${membership.organizationId}`}
                        className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {membership.organizationName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <OrganizationStatusBadge status={membership.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <UserFormDialog
        open={editing}
        mode="edit"
        user={user}
        directory={directory}
        onOpenChange={setEditing}
        onSubmit={saveUser}
      />
      <UserTeamsDialog
        open={managing}
        user={user}
        directory={directory}
        onOpenChange={setManaging}
      />
      <DeactivateUserDialog
        open={confirmingDeactivation}
        userName={user.name}
        onOpenChange={setConfirmingDeactivation}
        onConfirm={confirmDeactivation}
      />
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
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
    </article>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading user</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
