"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewStatusBadge } from "@/components/knowledge-base/review-badge";
import { formatCreatedDate } from "@/features/organizations/format";
import type { KnowledgeReviewAction, KnowledgeReviewEvent, KnowledgeReviewStatus } from "@/features/knowledge-base/types";

const actionCopy: Record<KnowledgeReviewAction, string> = {
  submit: "Submit for review",
  approve: "Approve",
  reject: "Reject",
  archive: "Archive",
  restore: "Restore",
};

export const reviewPrompt: Record<
  KnowledgeReviewAction,
  { title: string; description: string; confirmLabel: string; requireNotes: boolean }
> = {
  submit: {
    title: "Submit for review",
    description: "This moves the demo record to Pending Review. It does not send the record anywhere.",
    confirmLabel: "Submit for review",
    requireNotes: false,
  },
  approve: {
    title: "Approve record",
    description:
      "This is an administrative demo approval. It does not clinically verify the record or make it medically authoritative.",
    confirmLabel: "Approve",
    requireNotes: false,
  },
  reject: {
    title: "Reject record",
    description: "Rejected records can be edited and submitted again. Reviewer notes are required.",
    confirmLabel: "Reject",
    requireNotes: true,
  },
  archive: {
    title: "Archive record",
    description: "Archived records stay read-only until they are restored to Draft.",
    confirmLabel: "Archive",
    requireNotes: false,
  },
  restore: {
    title: "Restore record",
    description: "Restoring returns this demo record to Draft so it can be edited and reviewed again.",
    confirmLabel: "Restore",
    requireNotes: false,
  },
};

export function reviewActionsFor(status: KnowledgeReviewStatus): KnowledgeReviewAction[] {
  if (status === "Draft" || status === "Rejected") {
    return ["submit"];
  }
  if (status === "Pending Review") {
    return ["approve", "reject"];
  }
  if (status === "Approved") {
    return ["archive"];
  }
  return ["restore"];
}

export function RecordDetailDialog({
  open,
  title,
  summary,
  status,
  notes,
  history,
  onOpenChange,
  onEdit,
  onReview,
  children,
}: {
  open: boolean;
  title: string;
  summary: string;
  status: KnowledgeReviewStatus;
  notes: string;
  history: KnowledgeReviewEvent[];
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onReview: (action: KnowledgeReviewAction) => void;
  children: ReactNode;
}) {
  const archived = status === "Archived";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <DialogHeader className="pr-8">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{summary}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ReviewStatusBadge status={status} />
            {archived ? (
              <p className="text-xs text-muted-foreground">Archived records stay read-only until restored.</p>
            ) : null}
          </div>
          <dl className="mt-4 grid gap-3 text-sm">{children}</dl>
          <section className="mt-5">
            <h3 className="text-sm font-medium">Reviewer notes</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {notes.trim().length > 0 ? notes : "No reviewer notes yet."}
            </p>
          </section>
          <section className="mt-5">
            <h3 className="text-sm font-medium">Review history</h3>
            {history.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No review steps yet. New records start as drafts.</p>
            ) : (
              <ol className="mt-2 grid gap-2">
                {history.map((event) => (
                  <li key={event.id} className="rounded-lg border border-border px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <ReviewStatusBadge status={event.status} />
                      <p className="text-xs text-muted-foreground">
                        {formatCreatedDate(event.reviewedAt)} · {event.reviewerName}
                      </p>
                    </div>
                    {event.notes ? <p className="mt-1 text-sm leading-6">{event.notes}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </section>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            No document file is stored. Approval does not make this record clinically verified.
          </p>
        </div>
        <DialogFooter className="mx-0 mb-0 flex-wrap gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" onClick={onEdit} disabled={archived}>
            Edit metadata
          </Button>
          {reviewActionsFor(status).map((action) => (
            <Button key={action} type="button" onClick={() => onReview(action)}>
              {actionCopy[action]}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 leading-6">{value.trim().length > 0 ? value : "Not provided"}</dd>
    </div>
  );
}
