"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import { CategoryField, SourceField, TagPicker } from "@/components/knowledge-base/classification-fields";
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
import { Textarea } from "@/components/ui/textarea";
import { createGuidelineSchema, emptyGuidelineForm } from "@/features/knowledge-base/schema";
import { toGuidelineFormValues } from "@/features/knowledge-base/selectors";
import type { ClinicalGuidelineRecord, GuidelineFormValues, KnowledgeBase } from "@/features/knowledge-base/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function GuidelineFormDialog({
  open,
  mode,
  guideline,
  knowledge,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  guideline?: ClinicalGuidelineRecord;
  knowledge: KnowledgeBase;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GuidelineFormValues) => boolean;
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
          <GuidelineForm
            key={`${mode}-${guideline?.id ?? "new"}`}
            mode={mode}
            guideline={guideline}
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

function GuidelineForm({
  mode,
  guideline,
  knowledge,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  guideline?: ClinicalGuidelineRecord;
  knowledge: KnowledgeBase;
  onCancel: () => void;
  onSubmit: (values: GuidelineFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GuidelineFormValues>({
    resolver: zodResolver(createGuidelineSchema(knowledge, guideline?.id)),
    defaultValues: guideline ? toGuidelineFormValues(guideline) : emptyGuidelineForm(knowledge),
  });

  function submit(values: GuidelineFormValues) {
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
          <DialogTitle>{mode === "add" ? "Add guideline" : "Edit guideline"}</DialogTitle>
          <DialogDescription>
            Save fictional guideline metadata. This form does not store clinical recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <FormField label="Guideline title" htmlFor="guideline-title" error={errors.title?.message} required>
            <Input id="guideline-title" aria-invalid={Boolean(errors.title)} {...register("title")} />
          </FormField>
          <FormField label="Description" htmlFor="guideline-description" error={errors.description?.message} required>
            <Textarea id="guideline-description" rows={3} {...register("description")} />
          </FormField>
          <CategoryField
            control={control}
            name="specialtyId"
            knowledge={knowledge}
            currentId={guideline?.specialtyId}
            error={errors.specialtyId?.message}
            label="Specialty"
            inputId="guideline-specialty"
          />
          <FormField
            label="Publishing organization"
            htmlFor="guideline-publisher"
            error={errors.publishingOrganization?.message}
            required
          >
            <Input id="guideline-publisher" {...register("publishingOrganization")} />
          </FormField>
          <FormField label="Publication date" htmlFor="guideline-date" error={errors.publicationDate?.message} required>
            <Input id="guideline-date" type="date" {...register("publicationDate")} />
          </FormField>
          <FormField label="Version" htmlFor="guideline-version" error={errors.version?.message} required>
            <Input id="guideline-version" {...register("version")} />
          </FormField>
          <SourceField
            control={control}
            name="sourceId"
            knowledge={knowledge}
            currentId={guideline?.sourceId}
            error={errors.sourceId?.message}
            inputId="guideline-source"
          />
          <FormField label="Reference URL" htmlFor="guideline-url" error={errors.referenceUrl?.message}>
            <Input id="guideline-url" {...register("referenceUrl")} />
          </FormField>
          <TagPicker control={control} name="tagIds" knowledge={knowledge} error={errors.tagIds?.message} />
        </div>
      </div>
      <DialogFooter className="mx-0 mb-0 border-t border-border p-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Add guideline" : "Save metadata"}
        </Button>
      </DialogFooter>
    </form>
  );
}
