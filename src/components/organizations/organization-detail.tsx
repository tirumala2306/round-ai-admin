"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { OrganizationFormDialog } from "@/components/organizations/organization-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import {
  releaseOrganizationWrite,
  updateOrganization,
  useIsClient,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import {
  formatAddress,
  formatCreatedDate,
} from "@/features/organizations/format";
import { summarizeDepartments } from "@/features/organizations/selectors";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import type { OrganizationFormValues } from "@/features/organizations/types";

export function OrganizationDetail({
  organizationId,
}: {
  organizationId: string;
}) {
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const organization = directory.organizations.find(
    (item) => item.id === organizationId,
  );
  const departments = useMemo(
    () => summarizeDepartments(directory, organizationId),
    [directory, organizationId],
  );
  const [editing, setEditing] = useState(false);

  if (!isClient) {
    return <OrganizationDetailSkeleton />;
  }

  if (!organization) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-base font-semibold tracking-tight">
          Organization not in this sample
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This address does not match an organization in the current sample
          list. Refreshing the page restores the original records.
        </p>
        <Button asChild className="mt-6">
          <Link href="/organizations">Back to organizations</Link>
        </Button>
      </section>
    );
  }

  const address = formatAddress(organization);
  const userCount = directory.users.filter(
    (user) => user.organizationId === organization.id,
  ).length;
  const teamCount = departments.reduce(
    (total, department) => total + department.teamCount,
    0,
  );

  function saveOrganization(values: OrganizationFormValues) {
    const saved = updateOrganization(organizationId, values);
    if (!saved) {
      releaseOrganizationWrite();
      return;
    }
    releaseOrganizationWrite();
    setEditing(false);
    showOrganizationToast(`${values.name} was updated in this sample list.`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/organizations"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Organizations
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {organization.name}
            </h2>
            <OrganizationStatusBadge status={organization.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{organization.type}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            releaseOrganizationWrite();
            setEditing(true);
          }}
        >
          Edit organization
        </Button>
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
          <h3 className="text-sm font-semibold">Organization overview</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <DetailItem label="Type" value={organization.type} />
            <DetailItem label="Status" value={organization.status} />
            <DetailItem
              label="Created"
              value={formatCreatedDate(organization.createdAt)}
            />
            <DetailItem
              label="Updated"
              value={formatCreatedDate(organization.updatedAt)}
            />
            <DetailItem label="Email" value={organization.email || "Not provided"} />
            <DetailItem label="Phone" value={organization.phone || "Not provided"} />
            <div className="sm:col-span-2">
              <DetailItem label="Address" value={address.join(", ")} />
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Website</dt>
              <dd className="mt-1">
                {organization.website ? (
                  <a
                    href={organization.website}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {organization.website}
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
          </dl>
        </article>
        <section
          aria-label="Organization statistics"
          className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
        >
          <Stat label="Total departments" value={departments.length} />
          <Stat label="Total clinical teams" value={teamCount} />
          <Stat label="Total users" value={userCount} />
        </section>
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Departments</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Departments that belong to this organization. Department management
            is not available on this screen.
          </p>
        </div>
        {departments.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">
            This sample organization has no departments yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Department
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Description
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Clinical teams
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Users
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr
                    key={department.id}
                    className="border-b border-border last:border-0"
                  >
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {department.name}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {department.description}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold">Clinical teams</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Teams grouped under their department. Team management is not
            available on this screen.
          </p>
        </div>
        {departments.length === 0 ? (
          <p className="rounded-lg border border-border bg-card px-4 py-8 text-sm text-muted-foreground shadow-sm">
            This sample organization has no clinical teams yet.
          </p>
        ) : (
          departments.map((department) => (
            <section
              key={department.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border px-4 py-3">
                <h4 className="text-sm font-medium">{department.name}</h4>
              </div>
              {department.teams.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  No clinical teams in this department.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                        <th scope="col" className="px-4 py-2.5 font-medium">
                          Team
                        </th>
                        <th scope="col" className="px-4 py-2.5 font-medium">
                          Department
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-2.5 text-right font-medium"
                        >
                          Members
                        </th>
                        <th scope="col" className="px-4 py-2.5 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {department.teams.map((team) => (
                        <tr
                          key={team.id}
                          className="border-b border-border last:border-0"
                        >
                          <th
                            scope="row"
                            className="px-4 py-3 text-left font-medium"
                          >
                            {team.name}
                          </th>
                          <td className="px-4 py-3 text-muted-foreground">
                            {team.departmentName}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {team.memberCount}
                          </td>
                          <td className="px-4 py-3">
                            <OrganizationStatusBadge status={team.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))
        )}
      </section>
      <OrganizationFormDialog
        open={editing}
        mode="edit"
        organization={organization}
        directory={directory}
        onOpenChange={setEditing}
        onSubmit={saveOrganization}
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

function OrganizationDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading organization</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="h-24 rounded-lg border border-border bg-card" />
        <div className="h-24 rounded-lg border border-border bg-card" />
        <div className="h-24 rounded-lg border border-border bg-card" />
      </div>
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
