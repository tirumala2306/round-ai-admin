import { z } from "zod";
import { hasDuplicateClinicalTemplateName } from "@/features/clinical-templates/selectors";
import {
  clinicalTemplateScopes,
  clinicalTemplateWorkflows,
  type ClinicalTemplate,
  type ClinicalTemplateFormValues,
  type ClinicalTemplateScope,
  type ClinicalTemplateStatus,
} from "@/features/clinical-templates/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

export type ClinicalTemplateSectionDraft = {
  sectionId: string;
  title: string;
  guidance: string;
  sortOrder: number;
};

/** Dialog values. Scope is form-only; the stored template uses a nullable departmentId. */
export type ClinicalTemplateDialogValues = {
  name: string;
  description: string;
  workflow: string;
  organizationId: string;
  scope: ClinicalTemplateScope;
  departmentId: string;
  sections: ClinicalTemplateSectionDraft[];
};

const sectionDraftSchema = z.object({
  sectionId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, "Enter a section title.")
    .max(120, "Use 120 characters or fewer."),
  guidance: z
    .string()
    .trim()
    .min(1, "Enter guidance for this section.")
    .max(500, "Use 500 characters or fewer."),
  sortOrder: z.number().int().positive(),
});

const clinicalTemplateDialogSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the template name.")
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Enter a description.")
    .max(400, "Use 400 characters or fewer."),
  workflow: z.string().refine(
    (value) => clinicalTemplateWorkflows.some((workflow) => workflow === value),
    "Select a workflow.",
  ),
  organizationId: z.string().min(1, "Select an organization."),
  scope: z.enum(clinicalTemplateScopes, "Select a template scope."),
  departmentId: z.string(),
  sections: z.array(sectionDraftSchema).min(1, "Add at least one section."),
});

export function createClinicalTemplateDialogSchema(
  directory: OrganizationDirectory,
  exceptTemplateId?: string,
) {
  return clinicalTemplateDialogSchema.superRefine((values, context) => {
    const organizationExists = directory.organizations.some(
      (organization) => organization.id === values.organizationId,
    );

    if (values.organizationId !== "" && !organizationExists) {
      context.addIssue({
        code: "custom",
        path: ["organizationId"],
        message: "Select an organization.",
      });
    }

    if (values.scope === "department") {
      const department = directory.departments.find((item) => item.id === values.departmentId);
      if (!department || department.organizationId !== values.organizationId) {
        context.addIssue({
          code: "custom",
          path: ["departmentId"],
          message: "Select a department in this organization.",
        });
      }
    }

    if (
      organizationExists &&
      hasDuplicateClinicalTemplateName(
        directory,
        values.organizationId,
        values.name,
        exceptTemplateId,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "This organization already has a template with this name.",
      });
    }

    const seenTitles = new Set<string>();
    values.sections.forEach((section, index) => {
      if (section.sortOrder !== index + 1) {
        context.addIssue({
          code: "custom",
          path: ["sections", index, "sortOrder"],
          message: "Section order must stay sequential.",
        });
      }

      const title = section.title.trim().toLowerCase();
      if (title.length === 0) {
        return;
      }
      if (seenTitles.has(title)) {
        context.addIssue({
          code: "custom",
          path: ["sections", index, "title"],
          message: "Section titles must be unique in this template.",
        });
      }
      seenTitles.add(title);
    });
  });
}

export function createSectionDraft(sortOrder: number): ClinicalTemplateSectionDraft {
  return {
    sectionId: `section-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    guidance: "",
    sortOrder,
  };
}

export function emptyClinicalTemplateDialog(): ClinicalTemplateDialogValues {
  return {
    name: "",
    description: "",
    workflow: "",
    organizationId: "",
    scope: "organization",
    departmentId: "",
    sections: [createSectionDraft(1)],
  };
}

export function toClinicalTemplateDialogValues(
  template: ClinicalTemplate,
): ClinicalTemplateDialogValues {
  const sections = [...template.sections].sort((left, right) => left.sortOrder - right.sortOrder);

  return {
    name: template.name,
    description: template.description,
    workflow: template.workflow,
    organizationId: template.organizationId,
    scope: template.departmentId === null ? "organization" : "department",
    departmentId: template.departmentId ?? "",
    sections: sections.map((section, index) => ({
      sectionId: section.id,
      title: section.title,
      guidance: section.guidance,
      sortOrder: index + 1,
    })),
  };
}

export function toClinicalTemplateFormValues(
  values: ClinicalTemplateDialogValues,
  status: ClinicalTemplateStatus,
): ClinicalTemplateFormValues {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    workflow: values.workflow,
    organizationId: values.organizationId,
    departmentId: values.scope === "organization" ? null : values.departmentId,
    status,
    sections: values.sections.map((section, index) => ({
      id: section.sectionId,
      title: section.title.trim(),
      guidance: section.guidance.trim(),
      sortOrder: index + 1,
    })),
  };
}

export function withSectionOrder(
  sections: ClinicalTemplateSectionDraft[],
): ClinicalTemplateSectionDraft[] {
  return sections.map((section, index) => ({ ...section, sortOrder: index + 1 }));
}
