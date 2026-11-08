"use client";

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
import { auditDateRangeOptions } from "@/features/audit-logs/query";
import {
  auditActionTypes,
  auditModules,
  auditStatuses,
  type AuditActionType,
  type AuditDateRange,
  type AuditFilters,
  type AuditModule,
  type AuditStatus,
} from "@/features/audit-logs/types";
import type { Organization } from "@/features/organizations/types";

export function AuditFiltersBar({
  filters,
  organizations,
  filtersActive,
  onChange,
  onClear,
}: {
  filters: AuditFilters;
  organizations: Organization[];
  filtersActive: boolean;
  onChange: (filters: AuditFilters) => void;
  onClear: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="grid gap-1.5 md:col-span-2 xl:col-span-2">
        <Label htmlFor="audit-search">Search</Label>
        <Input
          id="audit-search"
          value={filters.search}
          placeholder="Search by event, actor, email, or entity"
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </div>
      <FilterSelect
        id="audit-range"
        label="Date range"
        value={filters.range}
        onChange={(range) => {
          if (auditDateRangeOptions.some((option) => option.id === range)) {
            onChange({ ...filters, range: range as AuditDateRange });
          }
        }}
        options={auditDateRangeOptions.map((option) => ({ value: option.id, label: option.label }))}
      />
      <FilterSelect
        id="audit-organization"
        label="Organization"
        value={filters.organizationId}
        onChange={(organizationId) => onChange({ ...filters, organizationId })}
        options={[
          { value: "All", label: "All organizations" },
          ...organizations.map((organization) => ({ value: organization.id, label: organization.name })),
        ]}
      />
      <FilterSelect
        id="audit-module"
        label="Module"
        value={filters.module}
        onChange={(module) => {
          if (module === "All" || auditModules.some((item) => item === module)) {
            onChange({ ...filters, module: module as AuditModule | "All" });
          }
        }}
        options={[{ value: "All", label: "All modules" }, ...auditModules.map((module) => ({ value: module, label: module }))]}
      />
      <FilterSelect
        id="audit-action"
        label="Action type"
        value={filters.actionType}
        onChange={(actionType) => {
          if (actionType === "All" || auditActionTypes.some((item) => item === actionType)) {
            onChange({ ...filters, actionType: actionType as AuditActionType | "All" });
          }
        }}
        options={[
          { value: "All", label: "All action types" },
          ...auditActionTypes.map((actionType) => ({ value: actionType, label: actionType })),
        ]}
      />
      <FilterSelect
        id="audit-status"
        label="Status"
        value={filters.status}
        onChange={(status) => {
          if (status === "All" || auditStatuses.some((item) => item === status)) {
            onChange({ ...filters, status: status as AuditStatus | "All" });
          }
        }}
        options={[{ value: "All", label: "All statuses" }, ...auditStatuses.map((status) => ({ value: status, label: status }))]}
      />
      <div className="flex items-end">
        <Button type="button" variant="outline" className="bg-card" onClick={onClear} disabled={!filtersActive}>
          Clear filters
        </Button>
      </div>
    </div>
  );
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
        <SelectContent>
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
