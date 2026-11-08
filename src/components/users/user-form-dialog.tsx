"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import {
  organizationStatuses,
  type OrganizationDirectory,
  type OrganizationUser,
  type UserFormValues,
} from "@/features/organizations/types";
import { createUserFormSchema, emptyUserForm } from "@/features/users/schema";

export function UserFormDialog({
  open,
  mode,
  user,
  directory,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  user?: OrganizationUser;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UserFormValues) => boolean;
}) {
  const schema = createUserFormSchema(directory, user?.id);
  const organizations = [...directory.organizations].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <UserForm
          key={`${mode}-${user?.id ?? "new"}`}
          mode={mode}
          schema={schema}
          organizations={organizations}
          directory={directory}
          defaultValues={user ? toFormValues(user) : emptyUserForm}
          onCancel={() => {
            releaseOrganizationWrite();
            onOpenChange(false);
          }}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

function UserForm({
  mode,
  schema,
  organizations,
  directory,
  defaultValues,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  schema: ReturnType<typeof createUserFormSchema>;
  organizations: OrganizationDirectory["organizations"];
  directory: OrganizationDirectory;
  defaultValues: UserFormValues;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState(defaultValues.organizationId);
  const [pendingOrganization, setPendingOrganization] = useState<
    { organizationId: string; teamNames: string[] } | undefined
  >();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });
  const teamOptions = directory.teams
    .filter((team) => team.organizationId === organizationId)
    .sort((left, right) => left.name.localeCompare(right.name));

  function applyOrganization(nextOrganizationId: string) {
    const kept = getValues("teamIds").filter((teamId) => {
      const team = directory.teams.find((item) => item.id === teamId);
      return team?.organizationId === nextOrganizationId;
    });
    setOrganizationId(nextOrganizationId);
    setValue("organizationId", nextOrganizationId, { shouldValidate: true });
    setValue("teamIds", kept, { shouldValidate: true });
  }

  function requestOrganization(nextOrganizationId: string) {
    const selected = getValues("teamIds");
    const foreign = directory.teams.filter(
      (team) =>
        selected.includes(team.id) && team.organizationId !== nextOrganizationId,
    );
    if (foreign.length > 0) {
      setPendingOrganization({
        organizationId: nextOrganizationId,
        teamNames: foreign.map((team) => team.name),
      });
      return;
    }
    applyOrganization(nextOrganizationId);
  }

  function submit(values: UserFormValues) {
    if (!claimOrganizationWrite()) {
      return;
    }
    setSubmitting(true);
    const saved = onSubmit(values);
    if (!saved) {
      releaseOrganizationWrite();
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        autoComplete="off"
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={handleSubmit(submit)}
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <DialogHeader className="pr-8">
            <DialogTitle>{mode === "add" ? "Add user" : "Edit user"}</DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Add a fictional staff record to this browser session. This does not create a login."
                : "Update this sample user. Changing organization removes teams from the previous organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            <Field label="Full name" htmlFor="user-name" error={errors.name?.message} required>
              <Input id="user-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="user-email" error={errors.email?.message} required>
              <Input
                id="user-email"
                type="email"
                inputMode="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </Field>
            <Field
              label="Organization"
              htmlFor="user-organization"
              error={errors.organizationId?.message}
              required
            >
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "unselected"}
                    onValueChange={requestOrganization}
                  >
                    <SelectTrigger
                      id="user-organization"
                      className="w-full"
                      aria-invalid={Boolean(errors.organizationId)}
                    >
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {organizations.map((organization) => (
                        <SelectItem key={organization.id} value={organization.id}>
                          {organization.status === "Inactive"
                            ? `${organization.name} (Inactive)`
                            : organization.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Role" htmlFor="user-role" error={errors.role?.message} required>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="user-role" className="w-full" aria-invalid={Boolean(errors.role)}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {[...directory.roles]
                        .sort((left, right) => {
                          if (left.type !== right.type) {
                            return left.type === "System" ? -1 : 1;
                          }
                          return left.name.localeCompare(right.name);
                        })
                        .map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              label="Clinical teams"
              htmlFor="user-teams"
              error={errors.teamIds?.message}
            >
              <div
                id="user-teams"
                className="max-h-40 overflow-y-auto rounded-md border border-input"
              >
                {organizationId.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    Select an organization first.
                  </p>
                ) : teamOptions.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    This organization has no clinical teams yet.
                  </p>
                ) : (
                  <Controller
                    name="teamIds"
                    control={control}
                    render={({ field }) => (
                      <ul>
                        {teamOptions.map((team) => {
                          const department = directory.departments.find(
                            (item) => item.id === team.departmentId,
                          );
                          const checked = field.value.includes(team.id);
                          return (
                            <li key={team.id}>
                              <label className="flex cursor-pointer items-start gap-2 px-3 py-2 hover:bg-accent">
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={checked}
                                  onChange={() => {
                                    field.onChange(
                                      checked
                                        ? field.value.filter((id) => id !== team.id)
                                        : [...field.value, team.id],
                                    );
                                  }}
                                />
                                <span>
                                  <span className="block text-sm">{team.name}</span>
                                  <span className="block text-xs text-muted-foreground">
                                    {department?.name ?? "Unknown department"}
                                    {team.status === "Inactive" ? " · Inactive" : ""}
                                  </span>
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  />
                )}
              </div>
            </Field>
            <Field label="Status" htmlFor="user-status" error={errors.status?.message} required>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="user-status"
                      className="w-full"
                      aria-invalid={Boolean(errors.status)}
                    >
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {organizationStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {mode === "add" ? "Add user" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
      <Dialog
        open={pendingOrganization !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setPendingOrganization(undefined);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Team memberships will be cleared</DialogTitle>
            <DialogDescription>
              These teams belong to the current organization. They will be
              removed from this user. The user will not be added to teams at
              the new organization automatically.
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-40 overflow-y-auto rounded-lg border border-border text-sm">
            {pendingOrganization?.teamNames.map((name) => (
              <li key={name} className="border-b border-border px-3 py-2 last:border-0">
                {name}
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingOrganization(undefined)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingOrganization) {
                  applyOrganization(pendingOrganization.organizationId);
                }
                setPendingOrganization(undefined);
              }}
            >
              Clear teams and continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required = false,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">required</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function toFormValues(user: OrganizationUser): UserFormValues {
  return {
    name: user.name,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
    teamIds: user.teamIds,
    status: user.status,
  };
}
