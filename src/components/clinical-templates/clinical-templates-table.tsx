"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, Pencil } from "lucide-react";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import type {
  ClinicalTemplateSortKey,
  SortDirection,
} from "@/features/clinical-templates/query";
import { formatCreatedDate } from "@/features/organizations/format";
import type { ClinicalTemplateListItem } from "@/features/clinical-templates/types";

const columns: { key: ClinicalTemplateSortKey | "sections"; label: string; align?: "right" }[] = [
  { key: "name", label: "Template Name" },
  { key: "organization", label: "Organization" },
  { key: "department", label: "Department / Scope" },
  { key: "workflow", label: "Workflow" },
  { key: "sections", label: "Sections", align: "right" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Updated At" },
];

export function ClinicalTemplatesTable({
  templates,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
}: {
  templates: ClinicalTemplateListItem[];
  sortKey: ClinicalTemplateSortKey;
  sortDirection: SortDirection;
  onSort: (key: ClinicalTemplateSortKey) => void;
  onEdit: (template: ClinicalTemplateListItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-sm">
        <caption className="sr-only">
          Sample clinical templates. Organization and department names come from the shared directory.
        </caption>
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            {columns.map((column) => {
              const sortable = column.key !== "sections";
              const active = sortable && sortKey === column.key;
              const Icon = !active
                ? ChevronsUpDown
                : sortDirection === "asc"
                  ? ChevronUp
                  : ChevronDown;

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    !sortable
                      ? undefined
                      : active
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                  }
                  className={
                    column.align === "right" ? "px-4 py-2.5 text-right" : "px-4 py-2.5"
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key as ClinicalTemplateSortKey)}
                      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
                    >
                      {column.label}
                      <Icon
                        className={active ? "size-3.5" : "size-3.5 opacity-40"}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              );
            })}
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-medium">
                <Link
                  href={`/clinical-templates/${template.id}`}
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {template.name}
                </Link>
              </th>
              <td className="px-4 py-3 text-muted-foreground">{template.organizationName}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {template.departmentName ?? "Organization-wide"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{template.workflow}</td>
              <td className="px-4 py-3 text-right tabular-nums">{template.sections.length}</td>
              <td className="px-4 py-3">
                <OrganizationStatusBadge status={template.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatCreatedDate(template.updatedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                      href={`/clinical-templates/${template.id}`}
                      aria-label={`View details for ${template.name}`}
                    >
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${template.name}`}
                    onClick={() => onEdit(template)}
                  >
                    <Pencil />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
