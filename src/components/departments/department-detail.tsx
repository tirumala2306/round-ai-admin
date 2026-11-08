"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { DeactivateDepartmentDialog } from "@/components/departments/deactivate-department-dialog";
import { DepartmentFormDialog } from "@/components/departments/department-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import {
  releaseOrganizationWrite,
  setDepartmentStatus,
  updateDepartment,
  useIsClient,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import type { DepartmentFormValues } from "@/features/organizations/types";

export function DepartmentDetail({ departmentId }: { departmentId: string }) {
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const department = directory.departments.find(
    (item) => item.id === departmentId,
  );
  const organization = directory.organizations.find(
    (item) => item.id === department?.organizationId,
  );
  const teams = useMemo(() => {
    if (!department) {
      return [];
    }

    return directory.teams
      .filter((team) => team.departmentId === department.id)
      .map((team) => ({
        ...team,
        organizationName:
          directory.organizations.find((item) => item.id === team.organizationId)
            ?.name ?? "Unknown organization",
        memberCount: directory.users.filter((user) =>
          user.teamIds.includes(team.id),
        ).length,
      }));
  }, [department, directory]);
  const [editing, setEditing] = useState(false);
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false);

  if (!isClient) {
    return <DepartmentDetailSkeleton />;
  }

  if (!department) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-base font-semibold tracking-tight">
          Department not in this sample
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This address does not match a department in the current sample list.
          Refreshing the page restores the original records.
        </p>
        <Button asChild className="mt-6">
          <Link href="/departments">Back to departments</Link>
        </Button>
      </section>
    );
  }

  const teamIds = new Set(teams.map((team) => team.id));
  const userCount = directory.users.filter((user) =>
    user.teamIds.some((teamId) => teamIds.has(teamId)),
  ).length;

  function saveDepartment(values: DepartmentFormValues) {
    const saved = updateDepartment(departmentId, values);
    if (!saved) {
      releaseOrganizationWrite();
      return;
    }
    releaseOrganizationWrite();
    setEditing(false);
    showOrganizationToast(`${values.name} was updated in this sample list.`);
  }

  function activate() {
    setDepartmentStatus(departmentId, "Active");
    showOrganizationToast(`${department?.name ?? "Department"} is active in this sample list.`);
  }

  function deactivate() {
    setDepartmentStatus(departmentId, "Inactive");
    setConfirmingDeactivation(false);
    showOrganizationToast(
      `${department?.name ?? "Department"} is inactive in this sample list.`,
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/departments"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Departments
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">
              {department.name}
            </h2>
            <OrganizationStatusBadge status={department.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
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
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (department.status === "Active") {
                setConfirmingDeactivation(true);
                return;
              }
              activate();
            }}
          >
            {department.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              releaseOrganizationWrite();
              setEditing(true);
            }}
          >
            Edit department
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
          <h3 className="text-sm font-semibold">Department overview</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <DetailItem label="Department" value={department.name} />
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
            <DetailItem label="Status" value={department.status} />
            <DetailItem
              label="Created"
              value={formatCreatedDate(department.createdAt)}
            />
            <div className="sm:col-span-2">
              <DetailItem
                label="Description"
                value={department.description || "Not provided"}
              />
            </div>
          </dl>
        </article>
        <section
          aria-label="Department statistics"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1"
        >
          <Stat label="Total clinical teams" value={teams.length} />
          <Stat label="Total users" value={userCount} />
        </section>
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3.5">
          <h3 className="text-sm font-semibold">Clinical teams</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Teams that belong to this department. Team management is not
            available on this screen.
          </p>
        </div>
        {teams.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">
            This sample department has no clinical teams yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Team name
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Organization
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Members
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {team.name}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">
                      {team.organizationName}
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
      <DepartmentFormDialog
        open={editing}
        mode="edit"
        department={department}
        directory={directory}
        onOpenChange={setEditing}
        onSubmit={saveDepartment}
      />
      <DeactivateDepartmentDialog
        open={confirmingDeactivation}
        departmentName={department.name}
        onOpenChange={setConfirmingDeactivation}
        onConfirm={deactivate}
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

function DepartmentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading department</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 rounded-lg border border-border bg-card" />
        <div className="h-24 rounded-lg border border-border bg-card" />
      </div>
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
