import type {
  ClinicalTemplate,
  ClinicalTemplateListItem,
  ClinicalTemplateStatus,
  ClinicalTemplateSummary,
} from "@/features/clinical-templates/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

const unknownOrganization = "Unknown organization";
const unknownDepartment = "Unknown department";

export function isOrganizationWideTemplate(template: Pick<ClinicalTemplate, "departmentId">) {
  return template.departmentId === null;
}

export function isDepartmentSpecificTemplate(template: Pick<ClinicalTemplate, "departmentId">) {
  return template.departmentId !== null;
}

export function listClinicalTemplates(directory: OrganizationDirectory): ClinicalTemplateListItem[] {
  return directory.clinicalTemplates.map((template) => toClinicalTemplateListItem(template, directory));
}

export function summarizeClinicalTemplates(
  templates: Pick<ClinicalTemplate, "status">[],
): ClinicalTemplateSummary {
  return {
    total: templates.length,
    active: templates.filter((template) => template.status === "Active").length,
    inactive: templates.filter((template) => template.status === "Inactive").length,
  };
}

export function filterClinicalTemplatesByOrganizationAndStatus(
  templates: ClinicalTemplateListItem[],
  organizationId: string | "All",
  status: ClinicalTemplateStatus | "All",
) {
  return templates.filter((template) => {
    if (organizationId !== "All" && template.organizationId !== organizationId) {
      return false;
    }
    if (status !== "All" && template.status !== status) {
      return false;
    }
    return true;
  });
}

export function hasDuplicateClinicalTemplateName(
  directory: OrganizationDirectory,
  organizationId: string,
  name: string,
  exceptTemplateId?: string,
) {
  const normalized = name.trim().toLowerCase();
  if (normalized.length === 0) {
    return false;
  }

  return directory.clinicalTemplates.some(
    (template) =>
      template.organizationId === organizationId &&
      template.id !== exceptTemplateId &&
      template.name.trim().toLowerCase() === normalized,
  );
}

export function toClinicalTemplateListItem(
  template: ClinicalTemplate,
  directory: OrganizationDirectory,
): ClinicalTemplateListItem {
  const organization = directory.organizations.find((item) => item.id === template.organizationId);
  const department =
    template.departmentId === null
      ? undefined
      : directory.departments.find((item) => item.id === template.departmentId);

  return {
    ...template,
    organizationName: organization?.name ?? unknownOrganization,
    departmentName:
      template.departmentId === null ? null : (department?.name ?? unknownDepartment),
    scope: template.departmentId === null ? "organization" : "department",
  };
}
