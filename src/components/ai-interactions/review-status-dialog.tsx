"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { reviewInteractionSchema } from "@/features/ai-interactions/schema";
import {
  reviewStatuses,
  type InteractionListItem,
  type ReviewStatus,
} from "@/features/ai-interactions/types";

export function ReviewStatusDialog({
  interaction,
  open,
  onOpenChange,
  onConfirm,
}: {
  interaction?: InteractionListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (status: ReviewStatus, notes: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {interaction && open ? (
          <ReviewForm
            key={`${interaction.id}-${interaction.reviewStatus ?? "none"}-${interaction.reviewNotes}`}
            interaction={interaction}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({
  interaction,
  onCancel,
  onConfirm,
}: {
  interaction: InteractionListItem;
  onCancel: () => void;
  onConfirm: (status: ReviewStatus, notes: string) => void;
}) {
  const [status, setStatus] = useState<ReviewStatus>(
    interaction.reviewStatus && interaction.reviewStatus !== "Dismissed"
      ? interaction.reviewStatus
      : "Under Review",
  );
  const [notes, setNotes] = useState(interaction.reviewNotes);
  const [error, setError] = useState("");

  function submit() {
    const parsed = reviewInteractionSchema.safeParse({ reviewStatus: status, reviewNotes: notes });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the review details.");
      return;
    }
    onConfirm(parsed.data.reviewStatus, parsed.data.reviewNotes);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update review for {interaction.id}</DialogTitle>
        <DialogDescription>
          Notes stay with this sample interaction for the rest of the browser session. The original response is not changed.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="review-status">Review status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              if (reviewStatuses.some((item) => item === value)) {
                setStatus(value as ReviewStatus);
              }
            }}
          >
            <SelectTrigger id="review-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reviewStatuses
                .filter((item) => item !== "Dismissed")
                .map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="review-notes">Review notes</Label>
          <Textarea
            id="review-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add a sample review note"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={submit}>
          Save review
        </Button>
      </DialogFooter>
    </>
  );
}
