"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clinicalTemplateStatuses } from "@/features/clinical-templates/types";
import type { ClinicalTemplateFilters } from "@/features/clinical-templates/types";

const scopeOptions = [
  { value: "All", label: "All" },
  { value: "organization", label: "Organization-wide" },
  { value: "department", label: "Department-specific" },
] as const;

export function ClinicalTemplatesFilters({
  filters,
  organizations,
  departments,
  workflows,
  filtersActive,
  onChange,
  onClear,
}: {
  filters: ClinicalTemplateFilters;
  organizations: { id: string; label: string }[];
  departments: { id: string; label: string }[];
  workflows: string[];
  filtersActive: boolean;
  onChange: (filters: ClinicalTemplateFilters) => void;
  onClear: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div className="grid gap-1.5 md:col-span-2 xl:col-span-3">
        <Label htmlFor="template-search">Search templates</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="template-search"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Search by name, ID, or description"
            className="bg-card pl-8"
          />
        </div>
      </div>
      <FilterSelect
        id="template-organization-filter"
        label="Organization"
        value={filters.organizationId}
        onChange={(organizationId) => onChange({ ...filters, organizationId })}
        options={[{ value: "All", label: "All" }, ...organizations.map(toOption)]}
      />
      <FilterSelect
        id="template-department-filter"
        label="Department"
        value={filters.departmentId}
        onChange={(departmentId) => onChange({ ...filters, departmentId })}
        options={[{ value: "All", label: "All" }, ...departments.map(toOption)]}
      />
      <FilterSelect
        id="template-workflow-filter"
        label="Workflow"
        value={filters.workflow}
        onChange={(workflow) => onChange({ ...filters, workflow })}
        options={[{ value: "All", label: "All" }, ...workflows.map((workflow) => ({ value: workflow, label: workflow }))]}
      />
      <FilterSelect
        id="template-status-filter"
        label="Status"
        value={filters.status}
        onChange={(status) => {
          if (status === "All" || clinicalTemplateStatuses.some((item) => item === status)) {
            onChange({
              ...filters,
              status: status as ClinicalTemplateFilters["status"],
            });
          }
        }}
        options={[
          { value: "All", label: "All" },
          ...clinicalTemplateStatuses.map((status) => ({ value: status, label: status })),
        ]}
      />
      <FilterSelect
        id="template-scope-filter"
        label="Scope"
        value={filters.scope}
        onChange={(scope) => {
          if (scopeOptions.some((option) => option.value === scope)) {
            onChange({
              ...filters,
              scope: scope as ClinicalTemplateFilters["scope"],
            });
          }
        }}
        options={[...scopeOptions]}
      />
      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          className="bg-card"
          onClick={onClear}
          disabled={!filtersActive}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}

function toOption(option: { id: string; label: string }) {
  return { value: option.id, label: option.label };
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
