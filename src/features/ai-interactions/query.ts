import { monitoringAsOfMs, rangeDurationMs } from "@/features/ai-monitoring/catalog";
import type {
  InteractionDateRange,
  InteractionFilters,
  InteractionListItem,
} from "@/features/ai-interactions/types";
import { paginateItems } from "@/features/ai-monitoring/query";

export const interactionPageSize = 5;

export const interactionDateRangeOptions: { id: InteractionDateRange; label: string }[] = [
  { id: "all", label: "All sample dates" },
  { id: "24h", label: "Last 24 hours" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

export function filterInteractions(interactions: InteractionListItem[], filters: InteractionFilters) {
  const query = filters.search.trim().toLowerCase();
  const rangeStart = filters.range === "all" ? null : monitoringAsOfMs - rangeDurationMs(filters.range);

  return interactions.filter((interaction) => {
    if (filters.organizationId !== "All" && interaction.organizationId !== filters.organizationId) {
      return false;
    }
    if (filters.featureId !== "all" && interaction.featureId !== filters.featureId) {
      return false;
    }
    if (filters.modelId !== "all" && interaction.modelId !== filters.modelId) {
      return false;
    }
    if (filters.status !== "All" && interaction.status !== filters.status) {
      return false;
    }
    if (filters.feedback !== "All" && interaction.feedback !== filters.feedback) {
      return false;
    }
    if (filters.review === "Not flagged" && interaction.reviewStatus !== null) {
      return false;
    }
    if (filters.review !== "All" && filters.review !== "Not flagged" && interaction.reviewStatus !== filters.review) {
      return false;
    }
    if (rangeStart !== null && Date.parse(interaction.timestamp) < rangeStart) {
      return false;
    }
    if (query.length === 0) {
      return true;
    }

    return [interaction.id, interaction.question, interaction.userName, interaction.userId]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function sortInteractions(interactions: InteractionListItem[], direction: "asc" | "desc") {
  return [...interactions].sort((left, right) => {
    const compared = left.timestamp.localeCompare(right.timestamp);
    return direction === "asc" ? compared : -compared;
  });
}

export function paginateInteractions(interactions: InteractionListItem[], page: number) {
  return paginateItems(interactions, page, interactionPageSize);
}
