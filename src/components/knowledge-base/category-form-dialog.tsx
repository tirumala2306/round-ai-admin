"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Control, type FieldValues, type Path } from "react-hook-form";
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
import {
  createKnowledgeCategorySchema,
  createKnowledgeTagSchema,
  emptyKnowledgeCategoryForm,
  emptyKnowledgeTagForm,
} from "@/features/knowledge-base/schema";
import { toCategoryFormValues, toTagFormValues } from "@/features/knowledge-base/selectors";
import {
  knowledgeActiveStatuses,
  type KnowledgeBase,
  type KnowledgeCategory,
  type KnowledgeCategoryFormValues,
  type KnowledgeTag,
  type KnowledgeTagFormValues,
} from "@/features/knowledge-base/types";
import { claimOrganizationWrite, releaseOrganizationWrite } from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function CategoryFormDialog({
  open,
  mode,
  category,
  knowledge,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  category?: KnowledgeCategory;
  knowledge: KnowledgeBase;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: KnowledgeCategoryFormValues) => boolean;
}) {
  return (
    <NamedDialog
      open={open}
      title={mode === "add" ? "Add category" : "Edit category"}
      description="Category names must stay unique in this sample list. A category used by records cannot be disabled."
      onOpenChange={onOpenChange}
    >
      {open ? (
        <CategoryForm
          key={`${mode}-${category?.id ?? "new"}`}
          mode={mode}
          category={category}
          knowledge={knowledge}
          onCancel={() => {
            releaseOrganizationWrite();
            onOpenChange(false);
          }}
          onSubmit={onSubmit}
        />
      ) : null}
    </NamedDialog>
  );
}

function CategoryForm({
  mode,
  category,
  knowledge,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  category?: KnowledgeCategory;
  knowledge: KnowledgeBase;
  onCancel: () => void;
  onSubmit: (values: KnowledgeCategoryFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KnowledgeCategoryFormValues>({
    resolver: zodResolver(createKnowledgeCategorySchema(knowledge, category?.id)),
    defaultValues: category ? toCategoryFormValues(category) : emptyKnowledgeCategoryForm(),
  });

  return (
    <form
      autoComplete="off"
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit((values) => {
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
      })}
    >
      <div className="grid gap-4 p-4">
        <FormField label="Category name" htmlFor="category-name" error={errors.name?.message} required>
          <Input id="category-name" {...register("name")} />
        </FormField>
        <FormField label="Description" htmlFor="category-description" error={errors.description?.message}>
          <Textarea id="category-description" rows={3} {...register("description")} />
        </FormField>
        <StatusField control={control} error={errors.status?.message} id="category-status" />
      </div>
      <FormButtons mode={mode} addLabel="Add category" saveLabel="Save category" submitting={submitting} onCancel={onCancel} />
    </form>
  );
}

export function TagFormDialog({
  open,
  mode,
  tag,
  knowledge,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  tag?: KnowledgeTag;
  knowledge: KnowledgeBase;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: KnowledgeTagFormValues) => boolean;
}) {
  return (
    <NamedDialog
      open={open}
      title={mode === "add" ? "Add tag" : "Edit tag"}
      description="Tag names must stay unique. A tag used by documents, guidelines, or evidence cannot be disabled."
      onOpenChange={onOpenChange}
    >
      {open ? (
        <TagForm
          key={`${mode}-${tag?.id ?? "new"}`}
          mode={mode}
          tag={tag}
          knowledge={knowledge}
          onCancel={() => {
            releaseOrganizationWrite();
            onOpenChange(false);
          }}
          onSubmit={onSubmit}
        />
      ) : null}
    </NamedDialog>
  );
}

function TagForm({
  mode,
  tag,
  knowledge,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  tag?: KnowledgeTag;
  knowledge: KnowledgeBase;
  onCancel: () => void;
  onSubmit: (values: KnowledgeTagFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<KnowledgeTagFormValues>({
    resolver: zodResolver(createKnowledgeTagSchema(knowledge, tag?.id)),
    defaultValues: tag ? toTagFormValues(tag) : emptyKnowledgeTagForm(),
  });

  return (
    <form
      autoComplete="off"
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit((values) => {
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
      })}
    >
      <div className="grid gap-4 p-4">
        <FormField label="Tag name" htmlFor="tag-name" error={errors.name?.message} required>
          <Input id="tag-name" {...register("name")} />
        </FormField>
        <StatusField control={control} error={errors.status?.message} id="tag-status" />
      </div>
      <FormButtons mode={mode} addLabel="Add tag" saveLabel="Save tag" submitting={submitting} onCancel={onCancel} />
    </form>
  );
}

function NamedDialog({
  open,
  title,
  description,
  onOpenChange,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
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
        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-0">
          <DialogHeader className="pr-8">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function StatusField<T extends FieldValues>({
  control,
  error,
  id,
}: {
  control: Control<T>;
  error?: string;
  id: string;
}) {
  return (
    <FormField label="Status" htmlFor={id} error={error} required>
      <Controller
        name={"status" as Path<T>}
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={id} className="w-full">
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
  );
}

function FormButtons({
  mode,
  addLabel,
  saveLabel,
  submitting,
  onCancel,
}: {
  mode: "add" | "edit";
  addLabel: string;
  saveLabel: string;
  submitting: boolean;
  onCancel: () => void;
}) {
  return (
    <DialogFooter className="mx-0 mb-0 border-t border-border p-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={submitting}>
        {mode === "add" ? addLabel : saveLabel}
      </Button>
    </DialogFooter>
  );
}
