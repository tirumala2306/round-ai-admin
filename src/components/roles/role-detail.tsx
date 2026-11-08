"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { PermissionMatrix } from "@/components/roles/permission-matrix";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import { RoleTypeBadge } from "@/components/roles/roles-table";
import { Button } from "@/components/ui/button";
import {
  releaseOrganizationWrite,
  setRolePermissions,
  updateRole,
  useIsClient,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";
import { countEnabledCategories } from "@/features/roles/permissions";
import { listRoleAssignees } from "@/features/roles/selectors";
import type { RoleFormValues } from "@/features/roles/types";

export function RoleDetail({ roleId }: { roleId: string }) {
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const role = directory.roles.find((item) => item.id === roleId);
  const assignees = role ? listRoleAssignees(directory, role.name) : [];
  const [editing, setEditing] = useState(false);

  if (!isClient) {
    return <RoleDetailSkeleton />;
  }

  if (!role) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-base font-semibold tracking-tight">Role not in this sample</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This address does not match a role in the current sample list. Refreshing
          the page restores the original records.
        </p>
        <Button asChild className="mt-6">
          <Link href="/roles">Back to roles</Link>
        </Button>
      </section>
    );
  }

  const permissionCount = role.permissionIds.length;
  const categoryCount = countEnabledCategories(role.permissionIds);

  function saveRole(values: RoleFormValues) {
    const result = updateRole(roleId, values);
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
    setEditing(false);
    return true;
  }

  function changePermissions(permissionIds: string[]) {
    const saved = setRolePermissions(roleId, permissionIds);
    if (!saved) {
      showOrganizationToast("The permissions could not be updated.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="w-fit px-0">
          <Link href="/roles">
            <ArrowLeft />
            Roles & Permissions
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link href="/roles" className="hover:text-foreground">
                Roles
              </Link>
              <ChevronRight className="size-3" aria-hidden="true" />
              <span>{role.name}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{role.name}</h2>
              <RoleTypeBadge type={role.type} />
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{role.description}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              releaseOrganizationWrite();
              setEditing(true);
            }}
          >
            Edit role
          </Button>
        </div>
      </div>
      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Role information</h3>
        </div>
        <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <InfoItem label="Role name" value={role.name} />
          <div>
            <dt className="text-xs text-muted-foreground">Role type</dt>
            <dd className="mt-1">
              <RoleTypeBadge type={role.type} />
            </dd>
          </div>
          <InfoItem label="Description" value={role.description} />
          <InfoItem label="Created date" value={formatCreatedDate(role.createdAt)} />
          <InfoItem label="Last updated" value={formatCreatedDate(role.updatedAt)} />
        </dl>
      </section>
      <section aria-label="Role statistics" className="grid gap-3 sm:grid-cols-3">
        <CountCard label="Assigned users" value={assignees.length} />
        <CountCard label="Total permissions" value={permissionCount} />
        <CountCard label="Enabled permission categories" value={categoryCount} />
      </section>
      <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <h3 className="text-sm font-semibold">Permissions</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Selected permissions are stored with this role for the current browser session.
          They do not change what a signed-in person can do.
        </p>
        <div className="mt-4">
          <PermissionMatrix selectedIds={role.permissionIds} onChange={changePermissions} />
        </div>
      </section>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">Assigned users</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Users keep the role stored on their record. This list reads that shared data.
          </p>
        </div>
        {assignees.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No users are assigned to this role.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">Users assigned to {role.name}</caption>
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Organization
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignees.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      <Link
                        href={`/users/${user.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {user.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.organizationName}</td>
                    <td className="px-4 py-3">
                      <OrganizationStatusBadge status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <RoleFormDialog
        open={editing}
        mode="edit"
        role={role}
        directory={directory}
        onOpenChange={setEditing}
        onSubmit={saveRole}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
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

function RoleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading role</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
