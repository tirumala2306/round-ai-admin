import type { ClinicalTemplate } from "@/features/clinical-templates/types";
import type { ClinicalWorkflowFormValues } from "@/features/system-settings/types";

export function templateChoices(
  templates: ClinicalTemplate[],
  organizationId: string,
  currentId: string,
) {
  return templates
    .filter(
      (template) =>
        template.organizationId === organizationId &&
        (template.status === "Active" || template.id === currentId),
    )
    .map((template) => ({
      value: template.id,
      label:
        template.status === "Active"
          ? `${template.name} · ${template.workflow}`
          : `${template.name} · Inactive`,
    }));
}

export function clinicalTemplateIssue(
  templates: ClinicalTemplate[],
  organizationId: string,
  values: Pick<ClinicalWorkflowFormValues, "defaultTemplateId">,
) {
  const template = templates.find((item) => item.id === values.defaultTemplateId);
  if (!template || template.organizationId !== organizationId) {
    return "Select a clinical template from this organization.";
  }
  if (template.status !== "Active") {
    return "Choose an active clinical template. This preference does not change the template record.";
  }
  return undefined;
}
