"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { KnowledgeConfirmDialog } from "@/components/knowledge-base/confirm-dialog";
import { RowActions } from "@/components/knowledge-base/row-actions";
import { SourceFormDialog } from "@/components/knowledge-base/source-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { beginKnowledgeChange, saveKnowledgeResult } from "@/components/knowledge-base/save-result";
import type { KnowledgeBase, KnowledgeSource, KnowledgeSourceFormValues } from "@/features/knowledge-base/types";
import {
  addKnowledgeSource,
  setKnowledgeSourceStatus,
  updateKnowledgeSource,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";

export function SourcesPanel({ knowledge }: { knowledge: KnowledgeBase }) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<KnowledgeSource | undefined>();
  const [viewingId, setViewingId] = useState<string | undefined>();
  const [statusTarget, setStatusTarget] = useState<KnowledgeSource | undefined>();
  const viewing = knowledge.sources.find((source) => source.id === viewingId);
  const sources = useMemo(() => {
    const term = query.trim().toLowerCase();
    return knowledge.sources.filter((source) => {
      if (!term) {
        return true;
      }
      return source.name.toLowerCase().includes(term) || source.description.toLowerCase().includes(term);
    });
  }, [knowledge.sources, query]);

  function saveSource(values: KnowledgeSourceFormValues) {
    const result = editing ? updateKnowledgeSource(editing.id, values) : addKnowledgeSource(values);
    const saved = saveKnowledgeResult(
      result,
      editing ? `${values.name.trim()} was updated in this sample list.` : `${values.name.trim()} was added to this sample list.`,
    );
    if (saved) {
      setAdding(false);
      setEditing(undefined);
    }
    return saved;
  }

  function changeStatus() {
    if (!statusTarget || !beginKnowledgeChange()) {
      return;
    }
    const next = statusTarget.status === "Active" ? "Inactive" : "Active";
    const saved = saveKnowledgeResult(
      setKnowledgeSourceStatus(statusTarget.id, next),
      next === "Active"
        ? `${statusTarget.name} is enabled in this sample list.`
        : `${statusTarget.name} is disabled in this sample list. No outside library was contacted.`,
    );
    if (saved) {
      setStatusTarget(undefined);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="grid gap-1.5 text-sm">
          <span className="sr-only">Search sources</span>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sources" className="sm:w-64" />
        </label>
        <Button type="button" onClick={() => { setEditing(undefined); setAdding(true); }}>
          <Plus />
          Add source
        </Button>
      </div>
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {sources.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">No sample sources match this search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5">Source name</th>
                  <th className="px-4 py-2.5">Source type</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Created date</th>
                  <th className="px-4 py-2.5">Last updated</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{source.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{source.sourceType}</td>
                    <td className="px-4 py-3">
                      <OrganizationStatusBadge status={source.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCreatedDate(source.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCreatedDate(source.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <RowActions
                        viewLabel={`View ${source.name}`}
                        editLabel={`Edit ${source.name}`}
                        onView={() => setViewingId(source.id)}
                        onEdit={() => { setAdding(false); setEditing(source); }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-24"
                          onClick={() => setStatusTarget(source)}
                        >
                          {source.status === "Active" ? "Disable" : "Enable"}
                        </Button>
                      </RowActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <SourceFormDialog
        open={adding || Boolean(editing)}
        mode={editing ? "edit" : "add"}
        source={editing}
        knowledge={knowledge}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditing(undefined);
          }
        }}
        onSubmit={saveSource}
      />
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => { if (!open) setViewingId(undefined); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.name}</DialogTitle>
            <DialogDescription>
              Sample source configuration. Status does not mean this admin panel is connected to that library.
            </DialogDescription>
          </DialogHeader>
          {viewing ? (
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Source type</dt>
                <dd>{viewing.sourceType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Description</dt>
                <dd className="leading-6">{viewing.description}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Source URL</dt>
                <dd>{viewing.url || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Status</dt>
                <dd className="mt-1"><OrganizationStatusBadge status={viewing.status} /></dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created</dt>
                <dd>{formatCreatedDate(viewing.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last updated</dt>
                <dd>{formatCreatedDate(viewing.updatedAt)}</dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
      <KnowledgeConfirmDialog
        open={Boolean(statusTarget)}
        title={statusTarget?.status === "Active" ? "Disable source" : "Enable source"}
        description="This changes the sample administrative status only. No external integration is called."
        confirmLabel={statusTarget?.status === "Active" ? "Disable" : "Enable"}
        onOpenChange={(open) => { if (!open) setStatusTarget(undefined); }}
        onConfirm={changeStatus}
      />
    </div>
  );
}
