"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { TemplateSectionEditor } from "@/components/clinical-templates/template-section-editor";
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
import { clinicalTemplateWorkflows } from "@/features/clinical-templates/types";
import type { ClinicalTemplate, ClinicalTemplateFormValues, ClinicalTemplateScope } from "@/features/clinical-templates/types";
import {
  createClinicalTemplateDialogSchema,
  emptyClinicalTemplateDialog,
  toClinicalTemplateDialogValues,
  toClinicalTemplateFormValues,
  type ClinicalTemplateDialogValues,
} from "@/features/clinical-templates/schema";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import type { OrganizationDirectory } from "@/features/organizations/types";

const scopeOptions: { value: ClinicalTemplateScope; label: string }[] = [
  { value: "organization", label: "Organization-wide" },
  { value: "department", label: "Department-specific" },
];

export function TemplateFormDialog({
  open,
  mode,
  template,
  directory,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  template?: ClinicalTemplate;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ClinicalTemplateFormValues) => boolean;
}) {
  const schema = createClinicalTemplateDialogSchema(directory, template?.id);
  const organizations = [...directory.organizations].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          releaseOrganizationWrite();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[min(44rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <TemplateForm
          key={`${mode}-${template?.id ?? "new"}`}
          mode={mode}
          schema={schema}
          directory={directory}
          organizations={organizations}
          status={template?.status ?? "Active"}
          defaultValues={
            template ? toClinicalTemplateDialogValues(template) : emptyClinicalTemplateDialog()
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

function TemplateForm({
  mode,
  schema,
  directory,
  organizations,
  status,
  defaultValues,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  schema: ReturnType<typeof createClinicalTemplateDialogSchema>;
  directory: OrganizationDirectory;
  organizations: OrganizationDirectory["organizations"];
  status: ClinicalTemplate["status"];
  defaultValues: ClinicalTemplateDialogValues;
  onCancel: () => void;
  onSubmit: (values: ClinicalTemplateFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState(defaultValues.organizationId);
  const [scope, setScope] = useState<ClinicalTemplateScope>(defaultValues.scope);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ClinicalTemplateDialogValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });
  const departments = directory.departments
    .filter((department) => department.organizationId === organizationId)
    .sort((left, right) => left.name.localeCompare(right.name));

  function submit(values: ClinicalTemplateDialogValues) {
    if (!claimOrganizationWrite()) {
      return;
    }

    setSubmitting(true);
    const saved = onSubmit(toClinicalTemplateFormValues(values, status));
    if (!saved) {
      releaseOrganizationWrite();
      setSubmitting(false);
    }
  }

  return (
    <form autoComplete="off" className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(submit)}>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DialogHeader className="pr-8">
          <DialogTitle>{mode === "add" ? "Create template" : "Edit template"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a fictional clinical template to this browser session."
              : "Update this sample template. The template ID and created date stay the same."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <Field label="Template name" htmlFor="template-name" error={errors.name?.message} required>
            <Input
              id="template-name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "template-name-error" : undefined}
              {...register("name")}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="template-description"
            error={errors.description?.message}
            required
          >
            <Textarea
              id="template-description"
              rows={3}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "template-description-error" : undefined}
              {...register("description")}
            />
          </Field>
          <Field label="Workflow" htmlFor="template-workflow" error={errors.workflow?.message} required>
            <Controller
              name="workflow"
              control={control}
              render={({ field }) => (
                <Select value={field.value || "unselected"} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="template-workflow"
                    className="w-full"
                    aria-invalid={Boolean(errors.workflow)}
                  >
                    <SelectValue placeholder="Select a workflow" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {clinicalTemplateWorkflows.map((workflow) => (
                      <SelectItem key={workflow} value={workflow}>
                        {workflow}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field
            label="Organization"
            htmlFor="template-organization"
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
                    id="template-organization"
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
          <Field label="Template scope" htmlFor="template-scope" error={errors.scope?.message} required>
            <Controller
              name="scope"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const next = value as ClinicalTemplateScope;
                    field.onChange(next);
                    setScope(next);
                    if (next === "organization") {
                      setValue("departmentId", "", { shouldValidate: false });
                    }
                  }}
                >
                  <SelectTrigger
                    id="template-scope"
                    className="w-full"
                    aria-invalid={Boolean(errors.scope)}
                  >
                    <SelectValue placeholder="Select a scope" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {scopeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          {scope === "department" ? (
            <Field
              label="Department"
              htmlFor="template-department"
              error={errors.departmentId?.message}
              required
            >
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || "unselected"} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="template-department"
                      className="w-full"
                      aria-invalid={Boolean(errors.departmentId)}
                    >
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {departments.map((department) => (
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
          ) : null}
          <TemplateSectionEditor
            control={control}
            register={register}
            getValues={getValues}
            errors={errors}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Create template" : "Save changes"}
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
