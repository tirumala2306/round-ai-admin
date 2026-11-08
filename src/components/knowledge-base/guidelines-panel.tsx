"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ClearFiltersButton, FilterSelect, SearchField } from "@/components/knowledge-base/filter-fields";
import { GuidelineFormDialog } from "@/components/knowledge-base/guideline-form-dialog";
import { ListFooter } from "@/components/knowledge-base/list-footer";
import { DetailItem, RecordDetailDialog, reviewPrompt } from "@/components/knowledge-base/record-detail-dialog";
import { ReviewNotesDialog } from "@/components/knowledge-base/review-notes-dialog";
import { ReviewStatusBadge } from "@/components/knowledge-base/review-badge";
import { RowActions } from "@/components/knowledge-base/row-actions";
import { beginKnowledgeChange, saveKnowledgeResult } from "@/components/knowledge-base/save-result";
import { Button } from "@/components/ui/button";
import {
  emptyGuidelineFilters,
  filterGuidelines,
  knowledgeReviewStatuses,
  paginateKnowledge,
  type GuidelineFilters,
  type GuidelineFormValues,
  type KnowledgeBase,
  type KnowledgeReviewAction,
} from "@/features/knowledge-base";
import { categoryById, sourceById, tagNames } from "@/features/knowledge-base/selectors";
import {
  addClinicalGuideline,
  reviewClinicalGuideline,
  updateClinicalGuideline,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";

export function GuidelinesPanel({
  knowledge,
  reviewerName,
}: {
  knowledge: KnowledgeBase;
  reviewerName: string;
}) {
  const [filters, setFilters] = useState<GuidelineFilters>(emptyGuidelineFilters);
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [viewingId, setViewingId] = useState<string | undefined>();
  const [reviewAction, setReviewAction] = useState<KnowledgeReviewAction | undefined>();
  const editing = knowledge.guidelines.find((item) => item.id === editingId);
  const viewing = knowledge.guidelines.find((item) => item.id === viewingId);
  const filtered = useMemo(() => filterGuidelines(knowledge.guidelines, filters), [knowledge.guidelines, filters]);
  const pagination = paginateKnowledge(filtered, page);
  const filtersActive =
    filters.search.trim().length > 0 || filters.specialtyId !== "All" || filters.reviewStatus !== "All";

  function applyFilters(next: GuidelineFilters) {
    setFilters(next);
    setPage(1);
  }

  function saveGuideline(values: GuidelineFormValues) {
    const result = editing ? updateClinicalGuideline(editing.id, values) : addClinicalGuideline(values);
    const saved = saveKnowledgeResult(
      result,
      editing ? `${values.title.trim()} was updated in this sample list.` : `${values.title.trim()} was added as a draft.`,
    );
    if (saved) {
      setAdding(false);
      setEditingId(undefined);
    }
    return saved;
  }

  function confirmReview(notes: string) {
    if (!viewing || !reviewAction || !beginKnowledgeChange()) {
      return false;
    }
    const saved = saveKnowledgeResult(
      reviewClinicalGuideline(viewing.id, reviewAction, notes, reviewerName),
      `${viewing.title} was updated in this sample review list.`,
    );
    if (saved) {
      setReviewAction(undefined);
    }
    return saved;
  }

  const prompt = reviewAction ? reviewPrompt[reviewAction] : undefined;

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Sample guideline metadata by specialty. These records do not contain treatment instructions.
        </p>
        <Button type="button" onClick={() => { setEditingId(undefined); setAdding(true); }}>
          <Plus />
          Add guideline
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SearchField
          id="guideline-search"
          label="Search guidelines"
          value={filters.search}
          placeholder="Search by guideline title"
          onChange={(search) => applyFilters({ ...filters, search })}
        />
        <FilterSelect
          id="guideline-specialty-filter"
          label="Specialty"
          value={filters.specialtyId}
          onChange={(specialtyId) => applyFilters({ ...filters, specialtyId })}
          options={[{ value: "All", label: "All" }, ...knowledge.categories.map((item) => ({ value: item.id, label: item.name }))]}
        />
        <FilterSelect
          id="guideline-status-filter"
          label="Review status"
          value={filters.reviewStatus}
          onChange={(reviewStatus) => applyFilters({ ...filters, reviewStatus })}
          options={[{ value: "All", label: "All" }, ...knowledgeReviewStatuses.map((item) => ({ value: item, label: item }))]}
        />
        <ClearFiltersButton active={filtersActive} onClear={() => applyFilters(emptyGuidelineFilters)} />
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {pagination.items.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">No sample guidelines match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5">Guideline title</th>
                  <th className="px-4 py-2.5">Specialty</th>
                  <th className="px-4 py-2.5">Publishing organization</th>
                  <th className="px-4 py-2.5">Publication date</th>
                  <th className="px-4 py-2.5">Version</th>
                  <th className="px-4 py-2.5">Review status</th>
                  <th className="px-4 py-2.5">Last reviewed</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((guideline) => (
                  <tr key={guideline.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{guideline.title}</td>
                    <td className="px-4 py-3">{categoryById(knowledge, guideline.specialtyId)?.name ?? "Unknown"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{guideline.publishingOrganization}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCreatedDate(guideline.publicationDate)}</td>
                    <td className="px-4 py-3">{guideline.version}</td>
                    <td className="px-4 py-3"><ReviewStatusBadge status={guideline.reviewStatus} /></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {guideline.lastReviewedAt ? formatCreatedDate(guideline.lastReviewedAt) : "Not reviewed"}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        viewLabel={`View ${guideline.title}`}
                        editLabel={`Edit ${guideline.title}`}
                        editDisabled={guideline.reviewStatus === "Archived"}
                        onView={() => setViewingId(guideline.id)}
                        onEdit={() => { setAdding(false); setEditingId(guideline.id); }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ListFooter
          emptyLabel="0 guidelines"
          rangeStart={pagination.rangeStart}
          rangeEnd={pagination.rangeEnd}
          total={filtered.length}
          page={pagination.page}
          pageCount={pagination.pageCount}
          onPage={setPage}
        />
      </section>
      <GuidelineFormDialog
        open={adding || Boolean(editing)}
        mode={editing ? "edit" : "add"}
        guideline={editing}
        knowledge={knowledge}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditingId(undefined);
          }
        }}
        onSubmit={saveGuideline}
      />
      {viewing ? (
        <RecordDetailDialog
          open
          title={viewing.title}
          summary="Fictional guideline metadata. No clinical recommendations are included."
          status={viewing.reviewStatus}
          notes={viewing.reviewerNotes}
          history={viewing.reviewHistory}
          onOpenChange={(open) => { if (!open) setViewingId(undefined); }}
          onEdit={() => { setEditingId(viewing.id); setViewingId(undefined); }}
          onReview={setReviewAction}
        >
          <DetailItem label="Description" value={viewing.description} />
          <DetailItem label="Specialty" value={categoryById(knowledge, viewing.specialtyId)?.name ?? "Unknown"} />
          <DetailItem label="Publishing organization" value={viewing.publishingOrganization} />
          <DetailItem label="Source" value={sourceById(knowledge, viewing.sourceId)?.name ?? "Unknown"} />
          <DetailItem label="Reference URL" value={viewing.referenceUrl} />
          <DetailItem label="Version" value={viewing.version} />
          <DetailItem label="Publication date" value={formatCreatedDate(viewing.publicationDate)} />
          <DetailItem label="Last reviewed" value={viewing.lastReviewedAt ? formatCreatedDate(viewing.lastReviewedAt) : ""} />
          <DetailItem label="Tags" value={tagNames(knowledge, viewing.tagIds).join(", ")} />
        </RecordDetailDialog>
      ) : null}
      {prompt ? (
        <ReviewNotesDialog
          open
          title={prompt.title}
          description={prompt.description}
          confirmLabel={prompt.confirmLabel}
          requireNotes={prompt.requireNotes}
          onOpenChange={(open) => { if (!open) setReviewAction(undefined); }}
          onConfirm={confirmReview}
        />
      ) : null}
    </div>
  );
}
