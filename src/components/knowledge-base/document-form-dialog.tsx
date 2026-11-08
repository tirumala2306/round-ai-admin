"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import {
  CategoryField,
  DemoFileNote,
  SourceField,
  TagPicker,
} from "@/components/knowledge-base/classification-fields";
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
import { createKnowledgeDocumentSchema, emptyKnowledgeDocumentForm } from "@/features/knowledge-base/schema";
import { toDocumentFormValues } from "@/features/knowledge-base/selectors";
import {
  knowledgeDocumentTypes,
  type KnowledgeBase,
  type KnowledgeDocument,
  type KnowledgeDocumentFormValues,
} from "@/features/knowledge-base/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function DocumentFormDialog({
  open,
  mode,
  document,
  knowledge,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  document?: KnowledgeDocument;
  knowledge: KnowledgeBase;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: KnowledgeDocumentFormValues) => boolean;
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
          <DocumentForm
            key={`${mode}-${document?.id ?? "new"}`}
            mode={mode}
            document={document}
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

function DocumentForm({
  mode,
  document,
  knowledge,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  document?: KnowledgeDocument;
  knowledge: KnowledgeBase;
  onCancel: () => void;
  onSubmit: (values: KnowledgeDocumentFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KnowledgeDocumentFormValues>({
    resolver: zodResolver(createKnowledgeDocumentSchema(knowledge, document?.id)),
    defaultValues: document ? toDocumentFormValues(document) : emptyKnowledgeDocumentForm(knowledge),
  });

  function submit(values: KnowledgeDocumentFormValues) {
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
          <DialogTitle>{mode === "add" ? "Add document" : "Edit document"}</DialogTitle>
          <DialogDescription>
            Save fictional document metadata. A new record starts as Draft. No file is uploaded or processed.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-4">
          <DemoFileNote />
          <FormField label="Document title" htmlFor="document-title" error={errors.title?.message} required>
            <Input id="document-title" aria-invalid={Boolean(errors.title)} {...register("title")} />
          </FormField>
          <FormField label="Description" htmlFor="document-description" error={errors.description?.message} required>
            <Textarea id="document-description" rows={3} {...register("description")} />
          </FormField>
          <FormField label="Document type" htmlFor="document-type" error={errors.documentType?.message} required>
            <Controller
              name="documentType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="document-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {knowledgeDocumentTypes.map((type) => (
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
            currentId={document?.categoryId}
            error={errors.categoryId?.message}
            inputId="document-category"
          />
          <SourceField
            control={control}
            name="sourceId"
            knowledge={knowledge}
            currentId={document?.sourceId}
            error={errors.sourceId?.message}
            inputId="document-source"
          />
          <TagPicker control={control} name="tagIds" knowledge={knowledge} error={errors.tagIds?.message} />
          <FormField
            label="Reference URL"
            htmlFor="document-url"
            error={errors.referenceUrl?.message}
            hint="Optional. Stored as text only."
          >
            <Input id="document-url" {...register("referenceUrl")} />
          </FormField>
          <FormField label="Version" htmlFor="document-version" error={errors.version?.message} required>
            <Input id="document-version" {...register("version")} />
          </FormField>
          <FormField
            label="Publication date"
            htmlFor="document-date"
            error={errors.publicationDate?.message}
            required
          >
            <Input id="document-date" type="date" {...register("publicationDate")} />
          </FormField>
        </div>
      </div>
      <DialogFooter className="mx-0 mb-0 border-t border-border p-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {mode === "add" ? "Add document" : "Save metadata"}
        </Button>
      </DialogFooter>
    </form>
  );
}
