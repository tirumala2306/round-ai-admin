"use client";

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selectableCategories, selectableSources, selectableTags } from "@/features/knowledge-base/selectors";
import type { KnowledgeBase } from "@/features/knowledge-base/types";

export function CategoryField<T extends FieldValues>({
  control,
  name,
  knowledge,
  currentId,
  error,
  label = "Category",
  inputId,
}: {
  control: Control<T>;
  name: Path<T>;
  knowledge: KnowledgeBase;
  currentId?: string;
  error?: string;
  label?: string;
  inputId: string;
}) {
  const categories = selectableCategories(knowledge, currentId);
  return (
    <FormField label={label} htmlFor={inputId} error={error} required>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <SelectTrigger id={inputId} className="w-full" aria-invalid={Boolean(error)}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.status === "Inactive" ? " (Inactive)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

export function SourceField<T extends FieldValues>({
  control,
  name,
  knowledge,
  currentId,
  error,
  inputId,
}: {
  control: Control<T>;
  name: Path<T>;
  knowledge: KnowledgeBase;
  currentId?: string;
  error?: string;
  inputId: string;
}) {
  const sources = selectableSources(knowledge, currentId);
  return (
    <FormField label="Knowledge source" htmlFor={inputId} error={error} required>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value || undefined} onValueChange={field.onChange}>
            <SelectTrigger id={inputId} className="w-full" aria-invalid={Boolean(error)}>
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                  {source.status === "Inactive" ? " (Inactive)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}

export function TagPicker<T extends FieldValues>({
  control,
  name,
  knowledge,
  error,
}: {
  control: Control<T>;
  name: Path<T>;
  knowledge: KnowledgeBase;
  error?: string;
}) {
  return (
    <FormField label="Tags" htmlFor="knowledge-tags" error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const selected = Array.isArray(field.value) ? (field.value as string[]) : [];
          const tags = selectableTags(knowledge, selected);
          return (
            <div id="knowledge-tags" className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const checked = selected.includes(tag.id);
                return (
                  <label
                    key={tag.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={checked}
                      onChange={(event) => {
                        field.onChange(
                          event.target.checked
                            ? [...selected, tag.id]
                            : selected.filter((id) => id !== tag.id),
                        );
                      }}
                    />
                    {tag.name}
                    {tag.status === "Inactive" ? " (Inactive)" : ""}
                  </label>
                );
              })}
            </div>
          );
        }}
      />
    </FormField>
  );
}

export function DemoFileNote() {
  return (
    <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs leading-5 text-muted-foreground">
      Demo placeholder. This form saves metadata only. No file is uploaded, stored, or read.
    </p>
  );
}
