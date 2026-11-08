"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, type FieldErrors, type UseFormGetValues, type UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSectionDraft,
  withSectionOrder,
  type ClinicalTemplateDialogValues,
} from "@/features/clinical-templates/schema";

export function TemplateSectionEditor({
  control,
  register,
  getValues,
  errors,
}: {
  control: Control<ClinicalTemplateDialogValues>;
  register: UseFormRegister<ClinicalTemplateDialogValues>;
  getValues: UseFormGetValues<ClinicalTemplateDialogValues>;
  errors: FieldErrors<ClinicalTemplateDialogValues>;
}) {
  const { fields, replace } = useFieldArray({ control, name: "sections" });
  const listError = sectionListMessage(errors.sections);

  function commit(sections: ClinicalTemplateDialogValues["sections"]) {
    replace(withSectionOrder(sections));
  }

  function addSection() {
    const current = getValues("sections");
    commit([...current, createSectionDraft(current.length + 1)]);
  }

  function removeSection(index: number) {
    commit(getValues("sections").filter((_, itemIndex) => itemIndex !== index));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const current = [...getValues("sections")];
    const nextIndex = index + direction;
    const moving = current[index];
    const neighbor = current[nextIndex];
    if (!moving || !neighbor) {
      return;
    }

    current[index] = neighbor;
    current[nextIndex] = moving;
    commit(current);
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium text-foreground">Clinical sections</legend>
      <p className="text-xs leading-5 text-muted-foreground">
        Add the parts of this template in the order clinicians should follow.
      </p>
      <ol className="grid gap-3">
        {fields.map((field, index) => {
          const titleError = errors.sections?.[index]?.title?.message;
          const guidanceError = errors.sections?.[index]?.guidance?.message;
          const titleId = `template-section-title-${field.id}`;
          const guidanceId = `template-section-guidance-${field.id}`;

          return (
            <li key={field.id} className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-foreground">Section {index + 1}</p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Move section ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => moveSection(index, -1)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Move section ${index + 1} down`}
                    disabled={index === fields.length - 1}
                    onClick={() => moveSection(index, 1)}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Remove section ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => removeSection(index)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <div className="mt-3 grid gap-3">
                <Field label="Section title" htmlFor={titleId} error={titleError} required>
                  <Input
                    id={titleId}
                    aria-invalid={Boolean(titleError)}
                    aria-describedby={titleError ? `${titleId}-error` : undefined}
                    {...register(`sections.${index}.title`)}
                  />
                </Field>
                <Field label="Guidance" htmlFor={guidanceId} error={guidanceError} required>
                  <Textarea
                    id={guidanceId}
                    rows={3}
                    aria-invalid={Boolean(guidanceError)}
                    aria-describedby={guidanceError ? `${guidanceId}-error` : undefined}
                    {...register(`sections.${index}.guidance`)}
                  />
                </Field>
              </div>
            </li>
          );
        })}
      </ol>
      {listError ? <p className="text-xs text-destructive">{listError}</p> : null}
      <Button type="button" variant="outline" className="justify-self-start" onClick={addSection}>
        <Plus />
        Add section
      </Button>
    </fieldset>
  );
}

function sectionListMessage(
  error: FieldErrors<ClinicalTemplateDialogValues>["sections"],
) {
  if (!error || Array.isArray(error)) {
    return undefined;
  }

  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }

  if ("root" in error && error.root && typeof error.root.message === "string") {
    return error.root.message;
  }

  return undefined;
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
