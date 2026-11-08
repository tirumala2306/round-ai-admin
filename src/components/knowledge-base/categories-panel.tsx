"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { CategoryFormDialog, TagFormDialog } from "@/components/knowledge-base/category-form-dialog";
import { KnowledgeConfirmDialog } from "@/components/knowledge-base/confirm-dialog";
import { ListFooter } from "@/components/knowledge-base/list-footer";
import { beginKnowledgeChange, saveKnowledgeResult } from "@/components/knowledge-base/save-result";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { paginateKnowledge } from "@/features/knowledge-base";
import { categoryUsage, tagUsage } from "@/features/knowledge-base/selectors";
import type {
  KnowledgeBase,
  KnowledgeCategory,
  KnowledgeCategoryFormValues,
  KnowledgeTag,
  KnowledgeTagFormValues,
} from "@/features/knowledge-base/types";
import {
  addKnowledgeCategory,
  addKnowledgeTag,
  setKnowledgeCategoryStatus,
  setKnowledgeTagStatus,
  updateKnowledgeCategory,
  updateKnowledgeTag,
} from "@/features/organizations/demo-store";
export function CategoriesPanel({ knowledge }: { knowledge: KnowledgeBase }) {
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KnowledgeCategory | undefined>();
  const [addingTag, setAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<KnowledgeTag | undefined>();
  const [categoryStatus, setCategoryStatus] = useState<KnowledgeCategory | undefined>();
  const [tagStatus, setTagStatus] = useState<KnowledgeTag | undefined>();
  const categories = paginateKnowledge(knowledge.categories, categoryPage);
  const tags = paginateKnowledge(knowledge.tags, tagPage);

  function saveCategory(values: KnowledgeCategoryFormValues) {
    const result = editingCategory
      ? updateKnowledgeCategory(editingCategory.id, values)
      : addKnowledgeCategory(values);
    const saved = saveKnowledgeResult(
      result,
      editingCategory
        ? `${values.name.trim()} was updated in this sample list.`
        : `${values.name.trim()} was added to this sample list.`,
    );
    if (saved) {
      setAddingCategory(false);
      setEditingCategory(undefined);
    }
    return saved;
  }

  function saveTag(values: KnowledgeTagFormValues) {
    const result = editingTag ? updateKnowledgeTag(editingTag.id, values) : addKnowledgeTag(values);
    const saved = saveKnowledgeResult(
      result,
      editingTag ? `${values.name.trim()} was updated in this sample list.` : `${values.name.trim()} was added to this sample list.`,
    );
    if (saved) {
      setAddingTag(false);
      setEditingTag(undefined);
    }
    return saved;
  }

  function confirmCategoryStatus() {
    if (!categoryStatus || !beginKnowledgeChange()) {
      return;
    }
    const next = categoryStatus.status === "Active" ? "Inactive" : "Active";
    saveKnowledgeResult(
      setKnowledgeCategoryStatus(categoryStatus.id, next),
      next === "Active"
        ? `${categoryStatus.name} is enabled in this sample list.`
        : `${categoryStatus.name} is disabled in this sample list.`,
    );
    setCategoryStatus(undefined);
  }

  function confirmTagStatus() {
    if (!tagStatus || !beginKnowledgeChange()) {
      return;
    }
    const next = tagStatus.status === "Active" ? "Inactive" : "Active";
    saveKnowledgeResult(
      setKnowledgeTagStatus(tagStatus.id, next),
      next === "Active"
        ? `${tagStatus.name} is enabled in this sample list.`
        : `${tagStatus.name} is disabled in this sample list.`,
    );
    setTagStatus(undefined);
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Categories</h2>
            <p className="text-sm text-muted-foreground">
              A category used by documents, guidelines, or evidence stays active.
            </p>
          </div>
          <Button type="button" onClick={() => { setEditingCategory(undefined); setAddingCategory(true); }}>
            <Plus />
            Add category
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Documents</th>
                  <th className="px-4 py-2.5 text-right">Guidelines</th>
                  <th className="px-4 py-2.5 text-right">Evidence</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.items.map((category) => {
                  const usage = categoryUsage(knowledge, category.id);
                  return (
                    <tr key={category.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{category.name}</p>
                        {category.description ? (
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3"><OrganizationStatusBadge status={category.status} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{usage.documents}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{usage.guidelines}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{usage.evidence}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-nowrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => { setAddingCategory(false); setEditingCategory(category); }}
                          >
                            <Pencil />
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="w-24" onClick={() => setCategoryStatus(category)}>
                            {category.status === "Active" ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ListFooter
            emptyLabel="0 categories"
            rangeStart={categories.rangeStart}
            rangeEnd={categories.rangeEnd}
            total={knowledge.categories.length}
            page={categories.page}
            pageCount={categories.pageCount}
            onPage={setCategoryPage}
          />
        </div>
      </section>
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Tags</h2>
            <p className="text-sm text-muted-foreground">Counts include documents, guidelines, and evidence.</p>
          </div>
          <Button type="button" onClick={() => { setEditingTag(undefined); setAddingTag(true); }}>
            <Plus />
            Add tag
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-2.5">Tag</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Documents</th>
                  <th className="px-4 py-2.5 text-right">Guidelines</th>
                  <th className="px-4 py-2.5 text-right">Evidence</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.items.map((tag) => {
                  const usage = tagUsage(knowledge, tag.id);
                  return (
                    <tr key={tag.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{tag.name}</td>
                      <td className="px-4 py-3"><OrganizationStatusBadge status={tag.status} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{usage.documents}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{usage.guidelines}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{usage.evidence}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-nowrap items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${tag.name}`}
                            onClick={() => { setAddingTag(false); setEditingTag(tag); }}
                          >
                            <Pencil />
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="w-24" onClick={() => setTagStatus(tag)}>
                            {tag.status === "Active" ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ListFooter
            emptyLabel="0 tags"
            rangeStart={tags.rangeStart}
            rangeEnd={tags.rangeEnd}
            total={knowledge.tags.length}
            page={tags.page}
            pageCount={tags.pageCount}
            onPage={setTagPage}
          />
        </div>
      </section>
      <CategoryFormDialog
        open={addingCategory || Boolean(editingCategory)}
        mode={editingCategory ? "edit" : "add"}
        category={editingCategory}
        knowledge={knowledge}
        onOpenChange={(open) => {
          if (!open) {
            setAddingCategory(false);
            setEditingCategory(undefined);
          }
        }}
        onSubmit={saveCategory}
      />
      <TagFormDialog
        open={addingTag || Boolean(editingTag)}
        mode={editingTag ? "edit" : "add"}
        tag={editingTag}
        knowledge={knowledge}
        onOpenChange={(open) => {
          if (!open) {
            setAddingTag(false);
            setEditingTag(undefined);
          }
        }}
        onSubmit={saveTag}
      />
      <KnowledgeConfirmDialog
        open={Boolean(categoryStatus)}
        title={categoryStatus?.status === "Active" ? "Disable category" : "Enable category"}
        description="Categories that still have sample records cannot be disabled."
        confirmLabel={categoryStatus?.status === "Active" ? "Disable" : "Enable"}
        onOpenChange={(open) => { if (!open) setCategoryStatus(undefined); }}
        onConfirm={confirmCategoryStatus}
      />
      <KnowledgeConfirmDialog
        open={Boolean(tagStatus)}
        title={tagStatus?.status === "Active" ? "Disable tag" : "Enable tag"}
        description="Tags that still appear on sample records cannot be disabled."
        confirmLabel={tagStatus?.status === "Active" ? "Disable" : "Enable"}
        onOpenChange={(open) => { if (!open) setTagStatus(undefined); }}
        onConfirm={confirmTagStatus}
      />
    </div>
  );
}
