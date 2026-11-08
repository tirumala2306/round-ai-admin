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
import { flagInteractionSchema } from "@/features/ai-interactions/schema";
import { flagReasons, type FlagReason, type InteractionListItem } from "@/features/ai-interactions/types";

export function FlagInteractionDialog({
  interaction,
  open,
  onOpenChange,
  onConfirm,
}: {
  interaction?: InteractionListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: FlagReason, notes: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {interaction && open ? (
          <FlagForm
            key={`${interaction.id}-${interaction.flagReason ?? "new"}-${interaction.reviewNotes}`}
            interaction={interaction}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FlagForm({
  interaction,
  onCancel,
  onConfirm,
}: {
  interaction: InteractionListItem;
  onCancel: () => void;
  onConfirm: (reason: FlagReason, notes: string) => void;
}) {
  const [reason, setReason] = useState<FlagReason>(interaction.flagReason ?? flagReasons[0]);
  const [notes, setNotes] = useState(interaction.reviewNotes);
  const [error, setError] = useState("");

  function submit() {
    const parsed = flagInteractionSchema.safeParse({ reason, notes });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the flag details.");
      return;
    }
    onConfirm(parsed.data.reason, parsed.data.notes);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Flag {interaction.id}</DialogTitle>
        <DialogDescription>
          The question and response stay in the sample list. Flagging marks the interaction for review.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="flag-reason">Flag reason</Label>
          <Select
            value={reason}
            onValueChange={(value) => {
              if (flagReasons.some((item) => item === value)) {
                setReason(value as FlagReason);
              }
            }}
          >
            <SelectTrigger id="flag-reason" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {flagReasons.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="flag-notes">Review notes</Label>
          <Textarea
            id="flag-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional sample note"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={submit}>
          Flag interaction
        </Button>
      </DialogFooter>
    </>
  );
}

export function DismissFlagDialog({
  interactionId,
  open,
  onOpenChange,
  onConfirm,
}: {
  interactionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dismiss the flag on {interactionId ?? "this interaction"}?</DialogTitle>
          <DialogDescription>
            The question, response, feedback, and review notes stay in the sample list. Dismissing does not delete the interaction.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Dismiss flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MarkReviewedDialog({
  interactionId,
  open,
  onOpenChange,
  onConfirm,
}: {
  interactionId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark {interactionId ?? "this interaction"} reviewed?</DialogTitle>
          <DialogDescription>
            The original question and response stay unchanged. This does not decide whether the sample response is medically correct.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Mark as reviewed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
