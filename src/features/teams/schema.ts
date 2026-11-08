import { z } from "zod";
import { hasDuplicateTeamName } from "@/features/organizations/selectors";
import {
  organizationStatuses,
  type OrganizationDirectory,
  type TeamFormValues,
} from "@/features/organizations/types";

export const teamFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the team name.")
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  organizationId: z.string().min(1, "Select an organization."),
  departmentId: z.string().min(1, "Select a department."),
  description: z.string().trim().max(240, "Use 240 characters or fewer."),
  status: z.enum(organizationStatuses, "Select a status."),
});

export function createTeamFormSchema(
  directory: OrganizationDirectory,
  exceptTeamId?: string,
) {
  return teamFormSchema.superRefine((values, context) => {
    const department = directory.departments.find(
      (item) => item.id === values.departmentId,
    );

    if (values.departmentId !== "" && !department) {
      context.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Select a department.",
      });
    }

    if (department && department.organizationId !== values.organizationId) {
      context.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Select a department in this organization.",
      });
    }

    if (
      department &&
      department.organizationId === values.organizationId &&
      hasDuplicateTeamName(
        directory,
        values.departmentId,
        values.name,
        exceptTeamId,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "This department already has a team with this name.",
      });
    }
  });
}

export const emptyTeamForm: TeamFormValues = {
  name: "",
  organizationId: "",
  departmentId: "",
  description: "",
  status: "Active",
};
