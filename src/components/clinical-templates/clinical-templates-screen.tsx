"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ClinicalTemplatesFilters } from "@/components/clinical-templates/clinical-templates-filters";
import { ClinicalTemplatesHeader } from "@/components/clinical-templates/clinical-templates-header";
import { ClinicalTemplatesKpiCards } from "@/components/clinical-templates/clinical-templates-kpi-cards";
import { ClinicalTemplatesTable } from "@/components/clinical-templates/clinical-templates-table";
import { TemplateFormDialog } from "@/components/clinical-templates/template-form-dialog";
import { Button } from "@/components/ui/button";
import {
  clinicalTemplateWorkflows,
  emptyClinicalTemplateFilters,
  filterClinicalTemplates,
  paginateClinicalTemplates,
  sortClinicalTemplates,
  type ClinicalTemplateFilters,
  type ClinicalTemplateFormValues,
  type ClinicalTemplateListItem,
  type ClinicalTemplateSortKey,
  type SortDirection,
} from "@/features/clinical-templates";
import { listClinicalTemplates } from "@/features/clinical-templates/selectors";
import {
  addClinicalTemplate,
  releaseOrganizationWrite,
  updateClinicalTemplate,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function ClinicalTemplatesScreen() {
  const directory = useOrganizationDirectory();
  const templates = useMemo(() => listClinicalTemplates(directory), [directory]);
  const [filters, setFilters] = useState<ClinicalTemplateFilters>(emptyClinicalTemplateFilters);
  const [sortKey, setSortKey] = useState<ClinicalTemplateSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicalTemplateListItem | undefined>();

  const organizations = useMemo(
    () =>
      [...directory.organizations]
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((organization) => ({ id: organization.id, label: organization.name })),
    [directory.organizations],
  );
  const departmentOptions = useMemo(
    () =>
      directory.departments
        .filter(
          (department) =>
            filters.organizationId === "All" ||
            department.organizationId === filters.organizationId,
        )
        .sort((left, right) => left.name.localeCompare(right.name))
        .map((department) => {
          const organizationName =
            directory.organizations.find((item) => item.id === department.organizationId)?.name ??
            "Unknown organization";

          return {
            id: department.id,
            label:
              filters.organizationId === "All"
                ? `${department.name} — ${organizationName}`
                : department.name,
          };
        }),
    [directory.departments, directory.organizations, filters.organizationId],
  );
  const workflows = useMemo(() => {
    const values = new Set<string>(clinicalTemplateWorkflows);
    for (const template of templates) {
      values.add(template.workflow);
    }
    return [...values].sort((left, right) => left.localeCompare(right));
  }, [templates]);

  const filtered = useMemo(
    () => filterClinicalTemplates(templates, filters),
    [filters, templates],
  );
  const sorted = useMemo(
    () => sortClinicalTemplates(filtered, sortKey, sortDirection),
    [filtered, sortKey, sortDirection],
  );
  const pagination = paginateClinicalTemplates(sorted, page);
  const filtersActive =
    filters.search.trim().length > 0 ||
    filters.organizationId !== "All" ||
    filters.departmentId !== "All" ||
    filters.workflow !== "All" ||
    filters.status !== "All" ||
    filters.scope !== "All";

  function applyFilters(next: ClinicalTemplateFilters) {
    const departmentIsValid =
      next.departmentId === "All" ||
      directory.departments.some(
        (department) =>
          department.id === next.departmentId &&
          (next.organizationId === "All" || department.organizationId === next.organizationId),
      );

    setFilters(departmentIsValid ? next : { ...next, departmentId: "All" });
    setPage(1);
  }

  function changeSort(key: ClinicalTemplateSortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setFilters(emptyClinicalTemplateFilters());
    setPage(1);
  }

  function openAdd() {
    releaseOrganizationWrite();
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(template: ClinicalTemplateListItem) {
    releaseOrganizationWrite();
    setEditing(template);
    setDialogOpen(true);
  }

  function saveTemplate(values: ClinicalTemplateFormValues) {
    if (editing) {
      const saved = updateClinicalTemplate(editing.id, values);
      releaseOrganizationWrite();
      if (!saved) {
        showOrganizationToast("This organization already has a template with this name.");
        return false;
      }
      showOrganizationToast(`${values.name} was updated in this sample list.`);
      setDialogOpen(false);
      return true;
    }

    const created = addClinicalTemplate(values);
    releaseOrganizationWrite();
    if (!created) {
      showOrganizationToast("This organization already has a template with this name.");
      return false;
    }
    showOrganizationToast(`${values.name} was added to this sample list.`);
    setFilters(emptyClinicalTemplateFilters());
    setSortKey("updatedAt");
    setSortDirection("desc");
    setPage(1);
    setDialogOpen(false);
    return true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ClinicalTemplatesHeader />
        <Button type="button" onClick={openAdd} className="shrink-0">
          <Plus />
          Create template
        </Button>
      </div>
      <ClinicalTemplatesKpiCards templates={templates} />
      <ClinicalTemplatesFilters
        filters={filters}
        organizations={organizations}
        departments={departmentOptions}
        workflows={workflows}
        filtersActive={filtersActive}
        onChange={applyFilters}
        onClear={clearFilters}
      />
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {templates.length === 0 ? (
          <EmptyCopy
            title="No clinical templates yet"
            description="Template records in this demo stay in this browser session. Refreshing the page restores the original sample set."
          />
        ) : pagination.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-base font-semibold tracking-tight">No templates match</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              No sample template matches these filters. Clear the filters to see the full list.
            </p>
            {filtersActive ? (
              <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <ClinicalTemplatesTable
            templates={pagination.items}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={changeSort}
            onEdit={openEdit}
          />
        )}
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {sorted.length === 0
              ? "0 templates"
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
      <TemplateFormDialog
        open={dialogOpen}
        mode={editing ? "edit" : "add"}
        template={editing}
        directory={directory}
        onOpenChange={setDialogOpen}
        onSubmit={saveTemplate}
      />
    </div>
  );
}

function EmptyCopy({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
