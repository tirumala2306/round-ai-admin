"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createKnowledgeSourceSchema, emptyKnowledgeSourceForm } from "@/features/knowledge-base/schema";
import { toSourceFormValues } from "@/features/knowledge-base/selectors";
import {
  knowledgeActiveStatuses,
  knowledgeSourceTypes,
  type KnowledgeBase,
  type KnowledgeSource,
  type KnowledgeSourceFormValues,
} from "@/features/knowledge-base/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function SourceFormDialog({
  open,
  mode,
  source,
  knowledge,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  source?: KnowledgeSource;
  knowledge: KnowledgeBase;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: KnowledgeSourceFormValues) => boolean;
}) {
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
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {open ? (
          <SourceForm
            key={`${mode}-${source?.id ?? "new"}`}
            mode={mode}
            source={source}
            knowledge={knowledge}
            onCancel={() => {
              releaseOrganizationWrite();
              onOpenChange(false);
            }}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function SourceForm({
  mode,
  source,
  knowledge,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  source?: KnowledgeSource;
  knowledge: KnowledgeBase;
  onCancel: () => void;
  onSubmit: (values: KnowledgeSourceFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KnowledgeSourceFormValues>({
    resolver: zodResolver(createKnowledgeSourceSchema(knowledge, source?.id)),
    defaultValues: source ? toSourceFormValues(source) : emptyKnowledgeSourceForm(),
  });

  function submit(values: KnowledgeSourceFormValues) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
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
          <DialogTitle>{mode === "add" ? "Add source" : "Edit source"}</DialogTitle>
          <DialogDescription>
            Save a sample source label. Enabling a source does not connect PubMed, WHO, CDC, or any other library.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <FormField label="Source name" htmlFor="source-name" error={errors.name?.message} required>
            <Input id="source-name" aria-invalid={Boolean(errors.name)} {...register("name")} />
          </FormField>
          <FormField label="Source type" htmlFor="source-type" error={errors.sourceType?.message} required>
            <Controller
              name="sourceType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="source-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeSourceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <FormField label="Description" htmlFor="source-description" error={errors.description?.message} required>
            <Textarea id="source-description" rows={3} {...register("description")} />
          </FormField>
          <FormField
            label="Source URL"
            htmlFor="source-url"
            error={errors.url?.message}
            hint="Optional. A URL is stored as text and is not opened or synced."
          >
            <Input id="source-url" {...register("url")} />
          </FormField>
          <FormField label="Status" htmlFor="source-status" error={errors.status?.message} required>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="source-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeActiveStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
      </div>
      <DialogFooter className="mx-0 mb-0 border-t border-border p-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Add source" : "Save source"}
        </Button>
      </DialogFooter>
    </form>
  );
}
