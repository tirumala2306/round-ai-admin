"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { InteractionFiltersBar } from "@/components/ai-interactions/interaction-filters";
import { InteractionHeader } from "@/components/ai-interactions/interaction-header";
import { InteractionKpiCards } from "@/components/ai-interactions/interaction-kpi-cards";
import { InteractionDetailDrawer } from "@/components/ai-interactions/interaction-detail-drawer";
import {
  DismissFlagDialog,
  FlagInteractionDialog,
  MarkReviewedDialog,
} from "@/components/ai-interactions/flag-interaction-dialog";
import { InteractionsTable } from "@/components/ai-interactions/interactions-table";
import { ReviewStatusDialog } from "@/components/ai-interactions/review-status-dialog";
import { aiInteractionsModule } from "@/features/ai-interactions";
import { filterInteractions, paginateInteractions, sortInteractions } from "@/features/ai-interactions/query";
import { listInteractions, summarizeInteractions } from "@/features/ai-interactions/selectors";
import type { FlagReason, InteractionFilters, ReviewStatus } from "@/features/ai-interactions/types";
import {
  claimOrganizationWrite,
  dismissInteractionFlag,
  flagInteraction,
  releaseOrganizationWrite,
  resetInteractions,
  updateInteractionReview,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

const emptyFilters: InteractionFilters = {
  search: "",
  organizationId: "All",
  featureId: "all",
  modelId: "all",
  status: "All",
  feedback: "All",
  review: "All",
  range: "all",
};

export function AiInteractionsScreen() {
  const directory = useOrganizationDirectory();
  const [filters, setFilters] = useState<InteractionFilters>(emptyFilters);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [flagId, setFlagId] = useState<string | undefined>();
  const [reviewId, setReviewId] = useState<string | undefined>();
  const [dismissId, setDismissId] = useState<string | undefined>();
  const [markReviewedId, setMarkReviewedId] = useState<string | undefined>();

  const interactions = useMemo(() => listInteractions(directory), [directory]);
  const filtered = useMemo(() => filterInteractions(interactions, filters), [interactions, filters]);
  const sorted = useMemo(() => sortInteractions(filtered, sortDirection), [filtered, sortDirection]);
  const summary = useMemo(() => summarizeInteractions(filtered), [filtered]);
  const pagination = paginateInteractions(sorted, page);
  const selected = interactions.find((interaction) => interaction.id === selectedId);
  const flagTarget = interactions.find((interaction) => interaction.id === flagId);
  const reviewTarget = interactions.find((interaction) => interaction.id === reviewId);

  function updateFilters(next: InteractionFilters) {
    setFilters(next);
    setPage(1);
  }

  function refreshDemoData() {
    resetInteractions();
    setFilters(emptyFilters);
    setSortDirection("desc");
    setPage(1);
    setSelectedId(undefined);
    showOrganizationToast("Sample interactions were reloaded. No AI service was contacted.");
  }

  function commit(action: () => boolean, message: string) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      return false;
    }
    const saved = action();
    releaseOrganizationWrite();
    showOrganizationToast(
      saved ? message : "That sample interaction could not be updated.",
    );
    return saved;
  }

  function confirmFlag(reason: FlagReason, notes: string) {
    if (!flagId) {
      return;
    }
    const saved = commit(
      () => flagInteraction(flagId, reason, notes),
      "The sample interaction was flagged for review.",
    );
    if (saved) {
      setFlagId(undefined);
    }
  }

  function confirmReview(status: ReviewStatus, notes: string) {
    if (!reviewId) {
      return;
    }
    const saved = commit(
      () => updateInteractionReview(reviewId, status, notes),
      "The sample review was saved for this session.",
    );
    if (saved) {
      setReviewId(undefined);
    }
  }

  function confirmDismiss() {
    if (!dismissId) {
      return;
    }
    const saved = commit(
      () => dismissInteractionFlag(dismissId),
      "The flag was dismissed. The interaction remains in the sample list.",
    );
    if (saved) {
      setDismissId(undefined);
    }
  }

  function confirmReviewed() {
    if (!markReviewedId) {
      return;
    }
    const notes = interactions.find((interaction) => interaction.id === markReviewedId)?.reviewNotes ?? "";
    const saved = commit(
      () => updateInteractionReview(markReviewedId, "Reviewed", notes),
      "The sample interaction was marked reviewed.",
    );
    if (saved) {
      setMarkReviewedId(undefined);
    }
  }

  const filtersActive = JSON.stringify(filters) !== JSON.stringify(emptyFilters);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <InteractionHeader onRefresh={refreshDemoData} />
      <InteractionKpiCards summary={summary} />
      <section className="min-w-0 rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-4">
          <InteractionFiltersBar
            filters={filters}
            organizations={directory.organizations}
            onChange={updateFilters}
          />
        </div>
        {sorted.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <h2 className="text-base font-semibold tracking-tight">{aiInteractionsModule.emptyTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {aiInteractionsModule.emptyDescription}
            </p>
            {filtersActive ? (
              <Button type="button" variant="outline" className="mt-4" onClick={() => updateFilters(emptyFilters)}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <InteractionsTable
            interactions={pagination.items}
            sortDirection={sortDirection}
            onSort={() => {
              setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
              setPage(1);
            }}
            onView={setSelectedId}
            onFlag={setFlagId}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0
              ? "0 interactions"
              : `Showing ${pagination.rangeStart}–${pagination.rangeEnd} of ${sorted.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <p className="min-w-16 text-center text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.pageCount}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((current) => current + 1)}
              disabled={pagination.page >= pagination.pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
      <InteractionDetailDrawer
        interaction={selected}
        open={selectedId !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(undefined);
          }
        }}
        onFlag={() => selectedId && setFlagId(selectedId)}
        onUpdateReview={() => selectedId && setReviewId(selectedId)}
        onMarkReviewed={() => selectedId && setMarkReviewedId(selectedId)}
        onDismiss={() => selectedId && setDismissId(selectedId)}
      />
      <FlagInteractionDialog
        interaction={flagTarget}
        open={flagId !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setFlagId(undefined);
          }
        }}
        onConfirm={confirmFlag}
      />
      <ReviewStatusDialog
        interaction={reviewTarget}
        open={reviewId !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setReviewId(undefined);
          }
        }}
        onConfirm={confirmReview}
      />
      <DismissFlagDialog
        interactionId={dismissId}
        open={dismissId !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setDismissId(undefined);
          }
        }}
        onConfirm={confirmDismiss}
      />
      <MarkReviewedDialog
        interactionId={markReviewedId}
        open={markReviewedId !== undefined}
        onOpenChange={(open) => {
          if (!open) {
            setMarkReviewedId(undefined);
          }
        }}
        onConfirm={confirmReviewed}
      />
    </div>
  );
}
