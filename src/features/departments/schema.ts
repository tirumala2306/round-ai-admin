import { z } from "zod";
import { hasDuplicateDepartmentName } from "@/features/organizations/selectors";
import {
  organizationStatuses,
  type DepartmentFormValues,
  type OrganizationDirectory,
} from "@/features/organizations/types";

export const departmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the department name.")
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  organizationId: z.string().min(1, "Select an organization."),
  description: z.string().trim().max(240, "Use 240 characters or fewer."),
  status: z.enum(organizationStatuses, "Select a status."),
});

export function createDepartmentFormSchema(
  directory: OrganizationDirectory,
  exceptDepartmentId?: string,
) {
  return departmentFormSchema.superRefine((values, context) => {
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

    if (
      organizationExists &&
      hasDuplicateDepartmentName(
        directory,
        values.organizationId,
        values.name,
        exceptDepartmentId,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "This organization already has a department with this name.",
      });
    }
  });
}

export const emptyDepartmentForm: DepartmentFormValues = {
  name: "",
  organizationId: "",
  description: "",
  status: "Active",
};
