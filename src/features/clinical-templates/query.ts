import { filterClinicalTemplatesByOrganizationAndStatus, isOrganizationWideTemplate } from "@/features/clinical-templates/selectors";
import type { ClinicalTemplateFilters, ClinicalTemplateListItem } from "@/features/clinical-templates/types";

export const clinicalTemplatePageSize = 5;

export type ClinicalTemplateSortKey =
  | "name"
  | "organization"
  | "department"
  | "workflow"
  | "status"
  | "updatedAt";

export type SortDirection = "asc" | "desc";

export function filterClinicalTemplates(
  templates: ClinicalTemplateListItem[],
  filters: ClinicalTemplateFilters,
) {
  const query = filters.search.trim().toLowerCase();
  const scoped = filterClinicalTemplatesByOrganizationAndStatus(
    templates,
    filters.organizationId,
    filters.status,
  );

  return scoped.filter((template) => {
    if (filters.departmentId !== "All" && template.departmentId !== filters.departmentId) {
      return false;
    }
    if (filters.workflow !== "All" && template.workflow !== filters.workflow) {
      return false;
    }
    if (filters.scope === "organization" && !isOrganizationWideTemplate(template)) {
      return false;
    }
    if (filters.scope === "department" && isOrganizationWideTemplate(template)) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }

    return [template.id, template.name, template.description].join(" ").toLowerCase().includes(query);
  });
}

export function sortClinicalTemplates(
  templates: ClinicalTemplateListItem[],
  sortKey: ClinicalTemplateSortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...templates].sort((left, right) => compareClinicalTemplates(left, right, sortKey) * direction);
}

export function paginateClinicalTemplates(templates: ClinicalTemplateListItem[], page: number) {
  const pageCount = Math.max(1, Math.ceil(templates.length / clinicalTemplatePageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const start = (currentPage - 1) * clinicalTemplatePageSize;

  return {
    page: currentPage,
    pageCount,
    items: templates.slice(start, start + clinicalTemplatePageSize),
    rangeStart: templates.length === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + clinicalTemplatePageSize, templates.length),
  };
}

function compareClinicalTemplates(
  left: ClinicalTemplateListItem,
  right: ClinicalTemplateListItem,
  sortKey: ClinicalTemplateSortKey,
) {
  switch (sortKey) {
    case "name":
      return left.name.localeCompare(right.name);
    case "organization":
      return left.organizationName.localeCompare(right.organizationName);
    case "department":
      return (left.departmentName ?? "").localeCompare(right.departmentName ?? "");
    case "workflow":
      return left.workflow.localeCompare(right.workflow);
    case "status":
      return left.status.localeCompare(right.status);
    case "updatedAt":
      return left.updatedAt.localeCompare(right.updatedAt);
  }
}

export function emptyClinicalTemplateFilters(
  overrides: Partial<ClinicalTemplateFilters> = {},
): ClinicalTemplateFilters {
  return {
    search: "",
    organizationId: "All",
    departmentId: "All",
    workflow: "All",
    status: "All",
    scope: "All",
    ...overrides,
  };
}
