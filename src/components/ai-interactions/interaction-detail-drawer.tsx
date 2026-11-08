"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InteractionDetail } from "@/components/ai-interactions/interaction-detail";
import type { InteractionListItem } from "@/features/ai-interactions/types";

export function InteractionDetailDrawer({
  interaction,
  open,
  onOpenChange,
  onFlag,
  onUpdateReview,
  onMarkReviewed,
  onDismiss,
}: {
  interaction?: InteractionListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlag: () => void;
  onUpdateReview: () => void;
  onMarkReviewed: () => void;
  onDismiss: () => void;
}) {
  const canReview = Boolean(interaction?.flagReason);
  const canDismiss = Boolean(interaction?.flagReason) && interaction?.reviewStatus !== "Dismissed";
  const canMarkReviewed = canReview && interaction?.reviewStatus !== "Reviewed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border px-5 py-4 pr-12">
          <SheetTitle>{interaction?.id ?? "Interaction"}</SheetTitle>
          <SheetDescription>
            Synthetic question and response for administrative review. No patient record is attached.
          </SheetDescription>
        </SheetHeader>
        {interaction ? (
          <>
            <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3">
              <Button type="button" variant="outline" onClick={onFlag}>
                Flag interaction
              </Button>
              {canReview ? (
                <Button type="button" variant="outline" onClick={onUpdateReview}>
                  Update review
                </Button>
              ) : null}
              {canMarkReviewed ? (
                <Button type="button" onClick={onMarkReviewed}>
                  Mark as reviewed
                </Button>
              ) : null}
              {canDismiss ? (
                <Button type="button" variant="destructive" onClick={onDismiss}>
                  Dismiss flag
                </Button>
              ) : null}
            </div>
            <InteractionDetail interaction={interaction} />
          </>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">This sample interaction is no longer in the list.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
