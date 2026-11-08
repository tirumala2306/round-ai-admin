"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { rejectNotesSchema, reviewNotesSchema } from "@/features/knowledge-base/schema";

export function ReviewNotesDialog({
  open,
  title,
  description,
  confirmLabel,
  requireNotes,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  requireNotes: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: string) => boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open ? (
          <NotesForm
            key={requireNotes ? "required" : "optional"}
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            requireNotes={requireNotes}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function NotesForm({
  title,
  description,
  confirmLabel,
  requireNotes,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  requireNotes: boolean;
  onCancel: () => void;
  onConfirm: (notes: string) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ notes: string }>({
    resolver: zodResolver(requireNotes ? rejectNotesSchema : reviewNotesSchema),
    defaultValues: { notes: "" },
  });

  function submit(values: { notes: string }) {
    setSubmitting(true);
    const saved = onConfirm(values.notes);
    if (!saved) {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="mt-4">
        <FormField
          label="Reviewer notes"
          htmlFor="review-notes"
          error={errors.notes?.message}
          required={requireNotes}
          hint="Notes stay with this demo record. Approval does not clinically verify it."
        >
          <Textarea
            id="review-notes"
            rows={4}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? "review-notes-error" : undefined}
            {...register("notes")}
          />
        </FormField>
      </div>
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
