import { LayoutTemplate } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const clinicalTemplatesModule = {
  title: "Clinical Templates",
  href: "/clinical-templates",
  icon: LayoutTemplate,
  description: "Clinical documentation templates and workflow structures.",
  summary:
    "Manage clinical documentation templates and workflow structures across your organizations and departments.",
  emptyTitle: "No clinical templates yet",
  emptyDescription:
    "Template records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;

export { CLINICAL_TEMPLATE_SAMPLE_NOTICE, sampleClinicalTemplates } from "@/features/clinical-templates/sample-data";
export {
  emptyClinicalTemplateFilters,
  filterClinicalTemplates,
  paginateClinicalTemplates,
  clinicalTemplatePageSize,
  sortClinicalTemplates,
} from "@/features/clinical-templates/query";
export type {
  ClinicalTemplateSortKey,
  SortDirection,
} from "@/features/clinical-templates/query";
export {
  filterClinicalTemplatesByOrganizationAndStatus,
  hasDuplicateClinicalTemplateName,
  isDepartmentSpecificTemplate,
  isOrganizationWideTemplate,
  listClinicalTemplates,
  summarizeClinicalTemplates,
  toClinicalTemplateListItem,
} from "@/features/clinical-templates/selectors";
export {
  clinicalTemplateScopes,
  clinicalTemplateStatuses,
  clinicalTemplateWorkflows,
} from "@/features/clinical-templates/types";
export type {
  ClinicalTemplate,
  ClinicalTemplateFilters,
  ClinicalTemplateFormValues,
  ClinicalTemplateListItem,
  ClinicalTemplateScope,
  ClinicalTemplateSection,
  ClinicalTemplateStatus,
  ClinicalTemplateSummary,
  ClinicalTemplateWorkflow,
} from "@/features/clinical-templates/types";
