"use client";

import { ChevronDown, ChevronUp, Eye, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FeedbackBadge,
  InteractionStatusBadge,
  ReviewStatusBadge,
} from "@/components/ai-interactions/interaction-badges";
import { formatMonitoringStamp } from "@/features/ai-monitoring/format";
import type { InteractionListItem } from "@/features/ai-interactions/types";

export function InteractionsTable({
  interactions,
  sortDirection,
  onSort,
  onView,
  onFlag,
}: {
  interactions: InteractionListItem[];
  sortDirection: "asc" | "desc";
  onSort: () => void;
  onView: (interactionId: string) => void;
  onFlag: (interactionId: string) => void;
}) {
  const SortIcon = sortDirection === "asc" ? ChevronUp : ChevronDown;

  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="w-full min-w-[1180px] text-sm">
        <caption className="sr-only">
          Synthetic AI interactions. Users and organizations come from the shared directory.
        </caption>
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            <th scope="col" className="px-4 py-2.5 font-medium">
              Interaction ID
            </th>
            <th scope="col" aria-sort={sortDirection === "asc" ? "ascending" : "descending"} className="px-4 py-2.5">
              <button
                type="button"
                onClick={onSort}
                className="inline-flex items-center gap-1 font-medium hover:text-foreground"
              >
                Timestamp
                <SortIcon className="size-3.5" aria-hidden="true" />
              </button>
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              User
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Organization
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              AI Feature
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Question Preview
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Model
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Response Status
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Feedback
            </th>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Review Status
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {interactions.map((interaction) => (
            <tr key={interaction.id} className="border-b border-border last:border-0">
              <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">
                <button type="button" className="hover:underline" onClick={() => onView(interaction.id)}>
                  {interaction.id}
                </button>
              </th>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatMonitoringStamp(interaction.timestamp)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{interaction.userName}</td>
              <td className="px-4 py-3 whitespace-nowrap">{interaction.organizationName}</td>
              <td className="px-4 py-3 whitespace-nowrap">{interaction.featureLabel}</td>
              <td className="max-w-64 px-4 py-3 text-muted-foreground">
                <span className="line-clamp-2">{interaction.question}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{interaction.modelName}</td>
              <td className="px-4 py-3">
                <InteractionStatusBadge status={interaction.status} />
              </td>
              <td className="px-4 py-3">
                <FeedbackBadge feedback={interaction.feedback} />
              </td>
              <td className="px-4 py-3">
                <ReviewStatusBadge status={interaction.reviewStatus} flagged={interaction.flagged} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onView(interaction.id)}
                  >
                    <Eye />
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onFlag(interaction.id)}
                  >
                    <Flag />
                    Flag
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
