"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PermissionMatrix } from "@/components/roles/permission-matrix";
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
import { Textarea } from "@/components/ui/textarea";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import type { AccessRole, OrganizationDirectory } from "@/features/organizations/types";
import { createRoleFormSchema, emptyRoleForm } from "@/features/roles/schema";
import type { RoleFormValues } from "@/features/roles/types";

export function RoleFormDialog({
  open,
  mode,
  role,
  directory,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  role?: AccessRole;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RoleFormValues) => boolean;
}) {
  const schema = createRoleFormSchema(directory, role?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          mode === "add"
            ? "flex max-h-[min(44rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
            : "flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        }
      >
        <RoleForm
          key={`${mode}-${role?.id ?? "new"}`}
          mode={mode}
          schema={schema}
          nameLocked={role?.type === "System"}
          defaultValues={role ? toFormValues(role) : emptyRoleForm}
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

function RoleForm({
  mode,
  schema,
  nameLocked,
  defaultValues,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  schema: ReturnType<typeof createRoleFormSchema>;
  nameLocked: boolean;
  defaultValues: RoleFormValues;
  onCancel: () => void;
  onSubmit: (values: RoleFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  function submit(values: RoleFormValues) {
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
    <form autoComplete="off" className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(submit)}>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DialogHeader className="pr-8">
          <DialogTitle>{mode === "add" ? "Create role" : "Edit role"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a custom role to this browser session and choose its starting permissions."
              : nameLocked
                ? "System role names stay fixed. You can update the description."
                : "Update this custom role. Assigned users keep this role when the name changes."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <Field label="Role name" htmlFor="role-name" error={errors.name?.message} required>
            <Input
              id="role-name"
              aria-invalid={Boolean(errors.name)}
              readOnly={nameLocked}
              aria-readonly={nameLocked}
              className={nameLocked ? "bg-muted" : undefined}
              {...register("name")}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="role-description"
            error={errors.description?.message}
            required
          >
            <Textarea
              id="role-description"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </Field>
          {mode === "add" ? (
            <Field label="Permissions" htmlFor="role-permissions" error={errors.permissionIds?.message}>
              <Controller
                name="permissionIds"
                control={control}
                render={({ field }) => (
                  <div id="role-permissions">
                    <PermissionMatrix
                      selectedIds={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            </Field>
          ) : null}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Create role" : "Save changes"}
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
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function toFormValues(role: AccessRole): RoleFormValues {
  return {
    name: role.name,
    description: role.description,
    permissionIds: role.permissionIds,
  };
}
