"use client";

import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logoMarks, type LogoMark } from "@/features/system-settings/types";
import { formatCreatedDate } from "@/features/organizations/format";

export function SettingsPanel({
  title,
  description,
  updatedAt,
  children,
}: {
  title: string;
  description: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        {updatedAt ? (
          <p className="mt-2 text-xs text-muted-foreground">Last updated {formatCreatedDate(updatedAt)}.</p>
        ) : null}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

export function SettingsNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-accent/40 px-3 py-3 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  );
}

export function SettingsSelect({
  id,
  label,
  value,
  error,
  required = false,
  disabled = false,
  hint,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={label} htmlFor={id} error={error} required={required} hint={hint}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full bg-card" aria-invalid={Boolean(error)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export function SettingsCheck({
  id,
  label,
  detail,
  disabled = false,
  registration,
}: {
  id: string;
  label: string;
  detail: string;
  disabled?: boolean;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label htmlFor={id} className="flex gap-3 rounded-lg border border-border bg-card px-3 py-3">
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 accent-primary"
        {...registration}
        disabled={disabled}
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span>
      </span>
    </label>
  );
}

export function LogoPreview({ mark }: { mark: LogoMark }) {
  const visual = logoMarks.find((item) => item.value === mark) ?? logoMarks[0];
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3">
      <div
        className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-primary-foreground"
        aria-hidden="true"
      >
        {visual.letters}
      </div>
      <div>
        <p className="text-sm font-medium">{visual.label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Preview only. No logo file is uploaded or stored.
        </p>
      </div>
    </div>
  );
}

export function ReadOnlyNote() {
  return (
    <p className="text-sm leading-6 text-muted-foreground">
      Edit General Settings is required to save this section.
    </p>
  );
}
