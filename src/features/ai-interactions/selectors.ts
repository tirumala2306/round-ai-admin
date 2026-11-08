import { estimateRequestCost, featureLabel, modelById } from "@/features/ai-monitoring/catalog";
import type { AiInteraction, InteractionListItem, InteractionSummary } from "@/features/ai-interactions/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

const unknownUser = "Unknown user";
const unknownOrganization = "Unknown organization";

export function listInteractions(directory: OrganizationDirectory): InteractionListItem[] {
  return directory.interactions.map((interaction) => toListItem(interaction, directory));
}

export function summarizeInteractions(interactions: InteractionListItem[]): InteractionSummary {
  const total = interactions.length;
  const responseTime = interactions.reduce((sum, interaction) => sum + interaction.responseTimeMs, 0);

  return {
    total,
    successful: interactions.filter((interaction) => interaction.status === "Success").length,
    flagged: interactions.filter((interaction) => interaction.flagged).length,
    positive: interactions.filter((interaction) => interaction.feedback === "Positive").length,
    negative: interactions.filter((interaction) => interaction.feedback === "Negative").length,
    averageResponseTimeMs: total === 0 ? 0 : responseTime / total,
  };
}

export function toListItem(interaction: AiInteraction, directory: OrganizationDirectory): InteractionListItem {
  const user = directory.users.find((item) => item.id === interaction.userId);
  const organization = directory.organizations.find((item) => item.id === interaction.organizationId);
  const model = modelById(interaction.modelId);

  return {
    ...interaction,
    userName: user?.name ?? unknownUser,
    organizationName: organization?.name ?? unknownOrganization,
    featureLabel: featureLabel(interaction.featureId),
    modelName: model?.name ?? interaction.modelId,
    estimatedCost: estimateRequestCost(interaction),
    flagged: interaction.reviewStatus === "Pending Review" || interaction.reviewStatus === "Under Review",
  };
}
