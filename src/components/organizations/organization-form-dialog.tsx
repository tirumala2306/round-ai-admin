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
import { cn } from "@/lib/utils";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import {
  createOrganizationFormSchema,
  emptyOrganizationForm,
} from "@/features/organizations/schema";
import type { OrganizationDirectory } from "@/features/organizations/types";
import {
  organizationStatuses,
  organizationTypes,
  type Organization,
  type OrganizationFormValues,
} from "@/features/organizations/types";

export function OrganizationFormDialog({
  open,
  mode,
  organization,
  directory,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  organization?: Organization;
  directory: OrganizationDirectory;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OrganizationFormValues) => void;
}) {
  const schema = createOrganizationFormSchema(directory, organization?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <OrganizationForm
          key={`${mode}-${organization?.id ?? "new"}`}
          mode={mode}
          schema={schema}
          defaultValues={organization ? toFormValues(organization) : emptyOrganizationForm}
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

function OrganizationForm({
  mode,
  schema,
  defaultValues,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  schema: ReturnType<typeof createOrganizationFormSchema>;
  defaultValues: OrganizationFormValues;
  onCancel: () => void;
  onSubmit: (values: OrganizationFormValues) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  function submit(values: OrganizationFormValues) {
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
          {mode === "add" ? "Add organization" : "Edit organization"}
        </DialogTitle>
        <DialogDescription>
          {mode === "add"
            ? "Add a fictional organization to this browser session."
            : "Update this sample organization. Inactive removes it from active use without deleting it."}
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          className="sm:col-span-2"
          label="Organization name"
          htmlFor="organization-name"
          error={errors.name?.message}
          required
        >
          <Input
            id="organization-name"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>
        <Field
          label="Organization type"
          htmlFor="organization-type"
          error={errors.type?.message}
          required
        >
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="organization-type"
                  className="w-full"
                  aria-invalid={Boolean(errors.type)}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {organizationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field
          label="Status"
          htmlFor="organization-status"
          error={errors.status?.message}
          required
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="organization-status"
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
        <Field label="Email" htmlFor="organization-email" error={errors.email?.message}>
          <Input
            id="organization-email"
            type="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>
        <Field
          label="Phone number"
          htmlFor="organization-phone"
          error={errors.phone?.message}
        >
          <Input
            id="organization-phone"
            type="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>
        <Field label="Country" htmlFor="organization-country" error={errors.country?.message}>
          <Input
            id="organization-country"
            aria-invalid={Boolean(errors.country)}
            {...register("country")}
          />
        </Field>
        <Field label="State" htmlFor="organization-state" error={errors.state?.message}>
          <Input
            id="organization-state"
            aria-invalid={Boolean(errors.state)}
            {...register("state")}
          />
        </Field>
        <Field label="City" htmlFor="organization-city" error={errors.city?.message}>
          <Input
            id="organization-city"
            aria-invalid={Boolean(errors.city)}
            {...register("city")}
          />
        </Field>
        <Field
          label="Website"
          htmlFor="organization-website"
          error={errors.website?.message}
        >
          <Input
            id="organization-website"
            inputMode="url"
            placeholder="https://"
            aria-invalid={Boolean(errors.website)}
            {...register("website")}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          label="Address"
          htmlFor="organization-address"
          error={errors.address?.message}
        >
          <Textarea
            id="organization-address"
            rows={2}
            aria-invalid={Boolean(errors.address)}
            {...register("address")}
          />
        </Field>
      </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Add organization" : "Save changes"}
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
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
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

function toFormValues(organization: Organization): OrganizationFormValues {
  return {
    name: organization.name,
    type: organization.type,
    email: organization.email,
    phone: organization.phone,
    country: organization.country,
    state: organization.state,
    city: organization.city,
    address: organization.address,
    website: organization.website,
    status: organization.status,
  };
}
