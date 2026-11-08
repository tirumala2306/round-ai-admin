"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import { CategoryField, TagPicker } from "@/components/knowledge-base/classification-fields";
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
import { createEvidenceSchema, emptyEvidenceForm } from "@/features/knowledge-base/schema";
import { toEvidenceFormValues } from "@/features/knowledge-base/selectors";
import {
  knowledgeEvidenceTypes,
  type EvidenceFormValues,
  type EvidenceRecord,
  type KnowledgeBase,
} from "@/features/knowledge-base/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function EvidenceFormDialog({
  open,
  mode,
  record,
  knowledge,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  record?: EvidenceRecord;
  knowledge: KnowledgeBase;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EvidenceFormValues) => boolean;
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
          <EvidenceForm
            key={`${mode}-${record?.id ?? "new"}`}
            mode={mode}
            record={record}
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

function EvidenceForm({
  mode,
  record,
  knowledge,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  record?: EvidenceRecord;
  knowledge: KnowledgeBase;
  onCancel: () => void;
  onSubmit: (values: EvidenceFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EvidenceFormValues>({
    resolver: zodResolver(createEvidenceSchema(knowledge, record?.id)),
    defaultValues: record ? toEvidenceFormValues(record) : emptyEvidenceForm(knowledge),
  });

  function submit(values: EvidenceFormValues) {
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
          <DialogTitle>{mode === "add" ? "Add evidence" : "Edit evidence"}</DialogTitle>
          <DialogDescription>
            Save a fictional citation. Do not enter a real PubMed record. Nothing here is verified.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <FormField label="Title" htmlFor="evidence-title" error={errors.title?.message} required>
            <Input id="evidence-title" aria-invalid={Boolean(errors.title)} {...register("title")} />
          </FormField>
          <FormField label="Authors" htmlFor="evidence-authors" error={errors.authors?.message} required>
            <Input id="evidence-authors" {...register("authors")} />
          </FormField>
          <FormField label="Journal or publishing source" htmlFor="evidence-journal" error={errors.journal?.message} required>
            <Input id="evidence-journal" {...register("journal")} />
          </FormField>
          <FormField label="Publication year" htmlFor="evidence-year" error={errors.publicationYear?.message} required>
            <Input
              id="evidence-year"
              type="number"
              inputMode="numeric"
              {...register("publicationYear", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="DOI" htmlFor="evidence-doi" error={errors.doi?.message} hint="Optional demo identifier.">
            <Input id="evidence-doi" {...register("doi")} />
          </FormField>
          <FormField label="PMID" htmlFor="evidence-pmid" error={errors.pmid?.message} hint="Optional demo identifier.">
            <Input id="evidence-pmid" {...register("pmid")} />
          </FormField>
          <FormField label="Reference URL" htmlFor="evidence-url" error={errors.referenceUrl?.message}>
            <Input id="evidence-url" {...register("referenceUrl")} />
          </FormField>
          <FormField label="Evidence type" htmlFor="evidence-type" error={errors.evidenceType?.message} required>
            <Controller
              name="evidenceType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="evidence-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeEvidenceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
          <CategoryField
            control={control}
            name="categoryId"
            knowledge={knowledge}
            currentId={record?.categoryId}
            error={errors.categoryId?.message}
            label="Specialty"
            inputId="evidence-category"
          />
          <TagPicker control={control} name="tagIds" knowledge={knowledge} error={errors.tagIds?.message} />
        </div>
      </div>
      <DialogFooter className="mx-0 mb-0 border-t border-border p-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Add evidence" : "Save metadata"}
        </Button>
      </DialogFooter>
    </form>
  );
}
