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
import { Textarea } from "@/components/ui/textarea";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import { organizationStatuses } from "@/features/organizations/types";
import type {
  ClinicalTeam,
  OrganizationDirectory,
  TeamFormValues,
} from "@/features/organizations/types";
import { createTeamFormSchema, emptyTeamForm } from "@/features/teams/schema";

export function TeamFormDialog({
  open,
  mode,
  team,
  directory,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  team?: ClinicalTeam;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TeamFormValues) => boolean;
}) {
  const schema = createTeamFormSchema(directory, team?.id);
  const organizations = [...directory.organizations].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <TeamForm
          key={`${mode}-${team?.id ?? "new"}`}
          mode={mode}
          schema={schema}
          organizations={organizations}
          departments={directory.departments}
          defaultValues={team ? toFormValues(team) : emptyTeamForm}
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

function TeamForm({
  mode,
  schema,
  organizations,
  departments,
  defaultValues,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  schema: ReturnType<typeof createTeamFormSchema>;
  organizations: OrganizationDirectory["organizations"];
  departments: OrganizationDirectory["departments"];
  defaultValues: TeamFormValues;
  onCancel: () => void;
  onSubmit: (values: TeamFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });
  const [organizationId, setOrganizationId] = useState(
    defaultValues.organizationId,
  );
  const departmentOptions = departments
    .filter((department) => department.organizationId === organizationId)
    .sort((left, right) => left.name.localeCompare(right.name));

  function submit(values: TeamFormValues) {
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
    <form
      autoComplete="off"
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit(submit)}
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DialogHeader className="pr-8">
          <DialogTitle>
            {mode === "add" ? "Add clinical team" : "Edit clinical team"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a fictional clinical team to this browser session."
              : "Update this sample team. Moving it to another organization does not move its members."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <Field
            label="Team name"
            htmlFor="team-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="team-name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>
          <Field
            label="Organization"
            htmlFor="team-organization"
            error={errors.organizationId?.message}
            required
          >
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "unselected"}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setOrganizationId(value);
                    setValue("departmentId", "", { shouldValidate: false });
                  }}
                >
                  <SelectTrigger
                    id="team-organization"
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
          <Field
            label="Department"
            htmlFor="team-department"
            error={errors.departmentId?.message}
            required
          >
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "unselected"}
                  onValueChange={field.onChange}
                  disabled={organizationId.length === 0}
                >
                  <SelectTrigger
                    id="team-department"
                    className="w-full"
                    aria-invalid={Boolean(errors.departmentId)}
                  >
                    <SelectValue
                      placeholder={
                        organizationId.length === 0
                          ? "Select an organization first"
                          : "Select a department"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {departmentOptions.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.status === "Inactive"
                          ? `${department.name} (Inactive)`
                          : department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="team-description"
            error={errors.description?.message}
          >
            <Textarea
              id="team-description"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </Field>
          <Field
            label="Status"
            htmlFor="team-status"
            error={errors.status?.message}
            required
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="team-status"
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
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Add clinical team" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
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

function toFormValues(team: ClinicalTeam): TeamFormValues {
  return {
    name: team.name,
    organizationId: team.organizationId,
    departmentId: team.departmentId,
    description: team.description,
    status: team.status,
  };
}
