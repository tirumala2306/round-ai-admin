"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { EvidenceFormDialog } from "@/components/knowledge-base/evidence-form-dialog";
import { ClearFiltersButton, FilterSelect, SearchField } from "@/components/knowledge-base/filter-fields";
import { ListFooter } from "@/components/knowledge-base/list-footer";
import { DetailItem, RecordDetailDialog, reviewPrompt } from "@/components/knowledge-base/record-detail-dialog";
import { ReviewNotesDialog } from "@/components/knowledge-base/review-notes-dialog";
import { ReviewStatusBadge } from "@/components/knowledge-base/review-badge";
import { RowActions } from "@/components/knowledge-base/row-actions";
import { beginKnowledgeChange, saveKnowledgeResult } from "@/components/knowledge-base/save-result";
import { Button } from "@/components/ui/button";
import {
  emptyEvidenceFilters,
  filterEvidence,
  knowledgeEvidenceTypes,
  knowledgeReviewStatuses,
  paginateKnowledge,
  type EvidenceFilters,
  type EvidenceFormValues,
  type KnowledgeBase,
  type KnowledgeReviewAction,
} from "@/features/knowledge-base";
import { categoryById, tagNames } from "@/features/knowledge-base/selectors";
import { addEvidenceRecord, reviewEvidenceRecord, updateEvidenceRecord } from "@/features/organizations/demo-store";

export function EvidencePanel({
  knowledge,
  reviewerName,
}: {
  knowledge: KnowledgeBase;
  reviewerName: string;
}) {
  const [filters, setFilters] = useState<EvidenceFilters>(emptyEvidenceFilters);
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [viewingId, setViewingId] = useState<string | undefined>();
  const [reviewAction, setReviewAction] = useState<KnowledgeReviewAction | undefined>();
  const editing = knowledge.evidence.find((item) => item.id === editingId);
  const viewing = knowledge.evidence.find((item) => item.id === viewingId);
  const filtered = useMemo(() => filterEvidence(knowledge.evidence, filters), [knowledge.evidence, filters]);
  const pagination = paginateKnowledge(filtered, page);
  const filtersActive =
    filters.search.trim().length > 0 ||
    filters.categoryId !== "All" ||
    filters.evidenceType !== "All" ||
    filters.reviewStatus !== "All";

  function applyFilters(next: EvidenceFilters) {
    setFilters(next);
    setPage(1);
  }

  function saveEvidence(values: EvidenceFormValues) {
    const result = editing ? updateEvidenceRecord(editing.id, values) : addEvidenceRecord(values);
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
      reviewEvidenceRecord(viewing.id, reviewAction, notes, reviewerName),
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
          Fictional citations labelled as demo records. They are not verified PubMed entries.
        </p>
        <Button type="button" onClick={() => { setEditingId(undefined); setAdding(true); }}>
          <Plus />
          Add evidence
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SearchField
          id="evidence-search"
          label="Search evidence"
          value={filters.search}
          placeholder="Search by title"
          onChange={(search) => applyFilters({ ...filters, search })}
        />
        <FilterSelect
          id="evidence-type-filter"
          label="Evidence type"
          value={filters.evidenceType}
          onChange={(evidenceType) => applyFilters({ ...filters, evidenceType })}
          options={[{ value: "All", label: "All" }, ...knowledgeEvidenceTypes.map((item) => ({ value: item, label: item }))]}
        />
        <FilterSelect
          id="evidence-category-filter"
          label="Specialty"
          value={filters.categoryId}
          onChange={(categoryId) => applyFilters({ ...filters, categoryId })}
          options={[{ value: "All", label: "All" }, ...knowledge.categories.map((item) => ({ value: item.id, label: item.name }))]}
        />
        <FilterSelect
          id="evidence-status-filter"
          label="Review status"
          value={filters.reviewStatus}
          onChange={(reviewStatus) => applyFilters({ ...filters, reviewStatus })}
          options={[{ value: "All", label: "All" }, ...knowledgeReviewStatuses.map((item) => ({ value: item, label: item }))]}
        />
        <ClearFiltersButton active={filtersActive} onClear={() => applyFilters(emptyEvidenceFilters)} />
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {pagination.items.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">No sample evidence matches these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5">Title</th>
                  <th className="px-4 py-2.5">Authors</th>
                  <th className="px-4 py-2.5">Journal</th>
                  <th className="px-4 py-2.5">Year</th>
                  <th className="px-4 py-2.5">Evidence type</th>
                  <th className="px-4 py-2.5">Specialty</th>
                  <th className="px-4 py-2.5">Review status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{record.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.authors}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.journal}</td>
                    <td className="px-4 py-3 tabular-nums">{record.publicationYear}</td>
                    <td className="px-4 py-3">{record.evidenceType}</td>
                    <td className="px-4 py-3">{categoryById(knowledge, record.categoryId)?.name ?? "Unknown"}</td>
                    <td className="px-4 py-3"><ReviewStatusBadge status={record.reviewStatus} /></td>
                    <td className="px-4 py-3">
                      <RowActions
                        viewLabel={`View ${record.title}`}
                        editLabel={`Edit ${record.title}`}
                        editDisabled={record.reviewStatus === "Archived"}
                        onView={() => setViewingId(record.id)}
                        onEdit={() => { setAdding(false); setEditingId(record.id); }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ListFooter
          emptyLabel="0 evidence records"
          rangeStart={pagination.rangeStart}
          rangeEnd={pagination.rangeEnd}
          total={filtered.length}
          page={pagination.page}
          pageCount={pagination.pageCount}
          onPage={setPage}
        />
      </section>
      <EvidenceFormDialog
        open={adding || Boolean(editing)}
        mode={editing ? "edit" : "add"}
        record={editing}
        knowledge={knowledge}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditingId(undefined);
          }
        }}
        onSubmit={saveEvidence}
      />
      {viewing ? (
        <RecordDetailDialog
          open
          title={viewing.title}
          summary="Fictional demo citation. This reference is not verified."
          status={viewing.reviewStatus}
          notes={viewing.reviewerNotes}
          history={viewing.reviewHistory}
          onOpenChange={(open) => { if (!open) setViewingId(undefined); }}
          onEdit={() => { setEditingId(viewing.id); setViewingId(undefined); }}
          onReview={setReviewAction}
        >
          <DetailItem label="Authors" value={viewing.authors} />
          <DetailItem label="Journal or publishing source" value={viewing.journal} />
          <DetailItem label="Publication year" value={String(viewing.publicationYear)} />
          <DetailItem label="DOI" value={viewing.doi} />
          <DetailItem label="PMID" value={viewing.pmid} />
          <DetailItem label="Reference URL" value={viewing.referenceUrl} />
          <DetailItem label="Evidence type" value={viewing.evidenceType} />
          <DetailItem label="Specialty" value={categoryById(knowledge, viewing.categoryId)?.name ?? "Unknown"} />
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
