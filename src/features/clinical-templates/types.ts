export const clinicalTemplateStatuses = ["Active", "Inactive"] as const;

export type ClinicalTemplateStatus = (typeof clinicalTemplateStatuses)[number];

export const clinicalTemplateScopes = ["organization", "department"] as const;

export type ClinicalTemplateScope = (typeof clinicalTemplateScopes)[number];

/** Sample workflow labels. The stored field stays a string so a later API can send its own identifiers. */
export const clinicalTemplateWorkflows = [
  "Progress note",
  "Clinical note",
  "Handoff",
  "Rounds",
  "Admission",
] as const;

export type ClinicalTemplateWorkflow = (typeof clinicalTemplateWorkflows)[number];

export type ClinicalTemplateSection = {
  id: string;
  title: string;
  guidance: string;
  sortOrder: number;
};

/**
 * One synthetic clinical documentation template.
 * organizationId and departmentId point at the shared directory.
 * A null departmentId means the template applies to the whole organization.
 */
export type ClinicalTemplate = {
  id: string;
  organizationId: string;
  departmentId: string | null;
  name: string;
  description: string;
  workflow: string;
  status: ClinicalTemplateStatus;
  sections: ClinicalTemplateSection[];
  createdAt: string;
  updatedAt: string;
};

export type ClinicalTemplateFormValues = {
  organizationId: string;
  departmentId: string | null;
  name: string;
  description: string;
  workflow: string;
  status: ClinicalTemplateStatus;
  sections: ClinicalTemplateSection[];
};

export type ClinicalTemplateListItem = ClinicalTemplate & {
  organizationName: string;
  departmentName: string | null;
  scope: ClinicalTemplateScope;
};

export type ClinicalTemplateSummary = {
  total: number;
  active: number;
  inactive: number;
};

export type ClinicalTemplateFilters = {
  search: string;
  organizationId: string | "All";
  departmentId: string | "All";
  workflow: string | "All";
  status: ClinicalTemplateStatus | "All";
  scope: ClinicalTemplateScope | "All";
};
