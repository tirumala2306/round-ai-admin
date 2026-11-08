"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DocumentFormDialog } from "@/components/knowledge-base/document-form-dialog";
import { ClearFiltersButton, FilterSelect, SearchField } from "@/components/knowledge-base/filter-fields";
import { ListFooter } from "@/components/knowledge-base/list-footer";
import { DetailItem, RecordDetailDialog, reviewPrompt } from "@/components/knowledge-base/record-detail-dialog";
import { ReviewNotesDialog } from "@/components/knowledge-base/review-notes-dialog";
import { ReviewStatusBadge } from "@/components/knowledge-base/review-badge";
import { RowActions } from "@/components/knowledge-base/row-actions";
import { beginKnowledgeChange, saveKnowledgeResult } from "@/components/knowledge-base/save-result";
import { Button } from "@/components/ui/button";
import {
  emptyDocumentFilters,
  filterDocuments,
  knowledgeDocumentTypes,
  knowledgeReviewStatuses,
  paginateKnowledge,
  type DocumentFilters,
  type KnowledgeBase,
  type KnowledgeDocumentFormValues,
  type KnowledgeReviewAction,
} from "@/features/knowledge-base";
import { categoryById, sourceById, tagNames } from "@/features/knowledge-base/selectors";
import {
  addKnowledgeDocument,
  reviewKnowledgeDocument,
  updateKnowledgeDocument,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";

export function DocumentsPanel({
  knowledge,
  reviewerName,
}: {
  knowledge: KnowledgeBase;
  reviewerName: string;
}) {
  const [filters, setFilters] = useState<DocumentFilters>(emptyDocumentFilters);
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [viewingId, setViewingId] = useState<string | undefined>();
  const [reviewAction, setReviewAction] = useState<KnowledgeReviewAction | undefined>();
  const editing = knowledge.documents.find((item) => item.id === editingId);
  const viewing = knowledge.documents.find((item) => item.id === viewingId);
  const filtered = useMemo(() => filterDocuments(knowledge.documents, filters), [knowledge.documents, filters]);
  const pagination = paginateKnowledge(filtered, page);
  const filtersActive =
    filters.search.trim().length > 0 ||
    filters.categoryId !== "All" ||
    filters.sourceId !== "All" ||
    filters.documentType !== "All" ||
    filters.reviewStatus !== "All";

  function applyFilters(next: DocumentFilters) {
    setFilters(next);
    setPage(1);
  }

  function saveDocument(values: KnowledgeDocumentFormValues) {
    const result = editing ? updateKnowledgeDocument(editing.id, values) : addKnowledgeDocument(values);
    const saved = saveKnowledgeResult(
      result,
      editing
        ? `${values.title.trim()} was updated in this sample list.`
        : `${values.title.trim()} was added as a draft.`,
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
      reviewKnowledgeDocument(viewing.id, reviewAction, notes, reviewerName),
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
        <p className="text-sm text-muted-foreground">Metadata only. Review actions open from the document details.</p>
        <Button type="button" onClick={() => { setEditingId(undefined); setAdding(true); }}>
          <Plus />
          Add document
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SearchField
          id="document-search"
          label="Search documents"
          value={filters.search}
          placeholder="Search by document title"
          onChange={(search) => applyFilters({ ...filters, search })}
        />
        <FilterSelect
          id="document-category-filter"
          label="Category"
          value={filters.categoryId}
          onChange={(categoryId) => applyFilters({ ...filters, categoryId })}
          options={[{ value: "All", label: "All" }, ...knowledge.categories.map((item) => ({ value: item.id, label: item.name }))]}
        />
        <FilterSelect
          id="document-source-filter"
          label="Source"
          value={filters.sourceId}
          onChange={(sourceId) => applyFilters({ ...filters, sourceId })}
          options={[{ value: "All", label: "All" }, ...knowledge.sources.map((item) => ({ value: item.id, label: item.name }))]}
        />
        <FilterSelect
          id="document-type-filter"
          label="Document type"
          value={filters.documentType}
          onChange={(documentType) => applyFilters({ ...filters, documentType })}
          options={[{ value: "All", label: "All" }, ...knowledgeDocumentTypes.map((item) => ({ value: item, label: item }))]}
        />
        <FilterSelect
          id="document-status-filter"
          label="Review status"
          value={filters.reviewStatus}
          onChange={(reviewStatus) => applyFilters({ ...filters, reviewStatus })}
          options={[{ value: "All", label: "All" }, ...knowledgeReviewStatuses.map((item) => ({ value: item, label: item }))]}
        />
        <ClearFiltersButton active={filtersActive} onClear={() => applyFilters(emptyDocumentFilters)} />
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {knowledge.documents.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">No sample documents yet.</p>
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold">No documents match</h2>
            <p className="mt-2 text-sm text-muted-foreground">Clear the filters to see the full sample list.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5">Document title</th>
                  <th className="px-4 py-2.5">Document type</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Version</th>
                  <th className="px-4 py-2.5">Review status</th>
                  <th className="px-4 py-2.5">Uploaded</th>
                  <th className="px-4 py-2.5">Last updated</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagination.items.map((document) => (
                  <tr key={document.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{document.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{document.documentType}</td>
                    <td className="px-4 py-3">{categoryById(knowledge, document.categoryId)?.name ?? "Unknown"}</td>
                    <td className="px-4 py-3">{sourceById(knowledge, document.sourceId)?.name ?? "Unknown"}</td>
                    <td className="px-4 py-3">{document.version}</td>
                    <td className="px-4 py-3"><ReviewStatusBadge status={document.reviewStatus} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCreatedDate(document.uploadedAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCreatedDate(document.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        viewLabel={`View ${document.title}`}
                        editLabel={`Edit ${document.title}`}
                        editDisabled={document.reviewStatus === "Archived"}
                        onView={() => setViewingId(document.id)}
                        onEdit={() => { setAdding(false); setEditingId(document.id); }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ListFooter
          emptyLabel="0 documents"
          rangeStart={pagination.rangeStart}
          rangeEnd={pagination.rangeEnd}
          total={filtered.length}
          page={pagination.page}
          pageCount={pagination.pageCount}
          onPage={setPage}
        />
      </section>
      <DocumentFormDialog
        open={adding || Boolean(editing)}
        mode={editing ? "edit" : "add"}
        document={editing}
        knowledge={knowledge}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditingId(undefined);
          }
        }}
        onSubmit={saveDocument}
      />
      {viewing ? (
        <RecordDetailDialog
          open
          title={viewing.title}
          summary="Fictional document metadata. No file contents are stored or shown."
          status={viewing.reviewStatus}
          notes={viewing.reviewerNotes}
          history={viewing.reviewHistory}
          onOpenChange={(open) => { if (!open) setViewingId(undefined); }}
          onEdit={() => { setEditingId(viewing.id); setViewingId(undefined); }}
          onReview={setReviewAction}
        >
          <DetailItem label="Description" value={viewing.description} />
          <DetailItem label="Document type" value={viewing.documentType} />
          <DetailItem label="Category" value={categoryById(knowledge, viewing.categoryId)?.name ?? "Unknown"} />
          <DetailItem label="Source" value={sourceById(knowledge, viewing.sourceId)?.name ?? "Unknown"} />
          <DetailItem label="Reference URL" value={viewing.referenceUrl} />
          <DetailItem label="Version" value={viewing.version} />
          <DetailItem label="Publication date" value={formatCreatedDate(viewing.publicationDate)} />
          <DetailItem label="Uploaded" value={formatCreatedDate(viewing.uploadedAt)} />
          <DetailItem label="Last updated" value={formatCreatedDate(viewing.updatedAt)} />
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
