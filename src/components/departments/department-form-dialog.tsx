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
  createDepartmentFormSchema,
  emptyDepartmentForm,
} from "@/features/departments/schema";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import {
  organizationStatuses,
  type Department,
  type DepartmentFormValues,
  type OrganizationDirectory,
} from "@/features/organizations/types";

export function DepartmentFormDialog({
  open,
  mode,
  department,
  directory,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  department?: Department;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DepartmentFormValues) => void;
}) {
  const schema = createDepartmentFormSchema(directory, department?.id);
  const organizations = [...directory.organizations].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DepartmentForm
          key={`${mode}-${department?.id ?? "new"}`}
          mode={mode}
          schema={schema}
          organizations={organizations}
          defaultValues={
            department ? toFormValues(department) : emptyDepartmentForm
          }
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

function DepartmentForm({
  mode,
  schema,
  organizations,
  defaultValues,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  schema: ReturnType<typeof createDepartmentFormSchema>;
  organizations: OrganizationDirectory["organizations"];
  defaultValues: DepartmentFormValues;
  onCancel: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  function submit(values: DepartmentFormValues) {
    if (!claimOrganizationWrite()) {
      return;
    }

    setSubmitting(true);
    onSubmit(values);
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
            {mode === "add" ? "Add department" : "Edit department"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a fictional department to this browser session."
              : "Update this sample department. Moving it also moves its clinical teams and the people on those teams."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <Field
            label="Department name"
            htmlFor="department-name"
            error={errors.name?.message}
            required
          >
            <Input
              id="department-name"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>
          <Field
            label="Organization"
            htmlFor="department-organization"
            error={errors.organizationId?.message}
            required
          >
            <Controller
              name="organizationId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "unselected"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="department-organization"
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
            label="Description"
            htmlFor="department-description"
            error={errors.description?.message}
          >
            <Textarea
              id="department-description"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </Field>
          <Field
            label="Status"
            htmlFor="department-status"
            error={errors.status?.message}
            required
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="department-status"
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
          {mode === "add" ? "Add department" : "Save changes"}
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

function toFormValues(department: Department): DepartmentFormValues {
  return {
    name: department.name,
    organizationId: department.organizationId,
    description: department.description,
    status: department.status,
  };
}
