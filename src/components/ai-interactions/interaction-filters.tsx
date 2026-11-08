"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiFeatures, aiModels } from "@/features/ai-monitoring/catalog";
import { interactionDateRangeOptions } from "@/features/ai-interactions/query";
import {
  feedbackStates,
  interactionStatuses,
  reviewStatuses,
  type InteractionDateRange,
  type InteractionFilters,
} from "@/features/ai-interactions/types";
import type { Organization } from "@/features/organizations/types";

export function InteractionFiltersBar({
  filters,
  organizations,
  onChange,
}: {
  filters: InteractionFilters;
  organizations: Organization[];
  onChange: (filters: InteractionFilters) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="grid gap-1.5 md:col-span-2 xl:col-span-2">
        <Label htmlFor="interaction-search">Search</Label>
        <Input
          id="interaction-search"
          value={filters.search}
          placeholder="Search by id, question, or user"
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </div>
      <FilterSelect
        id="interaction-range"
        label="Date range"
        value={filters.range}
        onChange={(range) => {
          if (interactionDateRangeOptions.some((option) => option.id === range)) {
            onChange({ ...filters, range: range as InteractionDateRange });
          }
        }}
        options={interactionDateRangeOptions.map((option) => ({ value: option.id, label: option.label }))}
      />
      <FilterSelect
        id="interaction-organization"
        label="Organization"
        value={filters.organizationId}
        onChange={(organizationId) => onChange({ ...filters, organizationId })}
        options={[
          { value: "All", label: "All organizations" },
          ...organizations.map((organization) => ({ value: organization.id, label: organization.name })),
        ]}
      />
      <FilterSelect
        id="interaction-feature"
        label="AI feature"
        value={filters.featureId}
        onChange={(featureId) => {
          if (featureId === "all" || aiFeatures.some((feature) => feature.id === featureId)) {
            onChange({ ...filters, featureId: featureId as InteractionFilters["featureId"] });
          }
        }}
        options={[{ value: "all", label: "All features" }, ...aiFeatures.map((feature) => ({ value: feature.id, label: feature.label }))]}
      />
      <FilterSelect
        id="interaction-model"
        label="Model"
        value={filters.modelId}
        onChange={(modelId) => {
          if (modelId === "all" || aiModels.some((model) => model.id === modelId)) {
            onChange({ ...filters, modelId: modelId as InteractionFilters["modelId"] });
          }
        }}
        options={[{ value: "all", label: "All models" }, ...aiModels.map((model) => ({ value: model.id, label: model.name }))]}
      />
      <FilterSelect
        id="interaction-status"
        label="Response status"
        value={filters.status}
        onChange={(status) => {
          if (status === "All" || interactionStatuses.some((item) => item === status)) {
            onChange({ ...filters, status: status as InteractionFilters["status"] });
          }
        }}
        options={[{ value: "All", label: "All statuses" }, ...interactionStatuses.map((status) => ({ value: status, label: status }))]}
      />
      <FilterSelect
        id="interaction-feedback"
        label="Feedback"
        value={filters.feedback}
        onChange={(feedback) => {
          if (feedback === "All" || feedbackStates.some((item) => item === feedback)) {
            onChange({ ...filters, feedback: feedback as InteractionFilters["feedback"] });
          }
        }}
        options={[{ value: "All", label: "All feedback" }, ...feedbackStates.map((feedback) => ({ value: feedback, label: feedback }))]}
      />
      <FilterSelect
        id="interaction-review"
        label="Review status"
        value={filters.review}
        onChange={(review) => {
          if (review === "All" || review === "Not flagged" || reviewStatuses.some((item) => item === review)) {
            onChange({ ...filters, review: review as InteractionFilters["review"] });
          }
        }}
        options={[
          { value: "All", label: "All review states" },
          { value: "Not flagged", label: "Not flagged" },
          ...reviewStatuses.map((status) => ({ value: status, label: status })),
        ]}
      />
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
