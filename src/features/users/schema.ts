import { z } from "zod";
import { hasDuplicateEmail } from "@/features/organizations/selectors";
import {
  organizationStatuses,
  type OrganizationDirectory,
  type UserFormValues,
} from "@/features/organizations/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the full name.")
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Enter an email address.")
    .max(120, "Use 120 characters or fewer.")
    .refine((value) => emailPattern.test(value), "Enter a valid email address."),
  organizationId: z.string().min(1, "Select an organization."),
  role: z.string().trim().min(1, "Select a role."),
  teamIds: z.array(z.string()),
  status: z.enum(organizationStatuses, "Select a status."),
});

export function createUserFormSchema(
  directory: OrganizationDirectory,
  exceptUserId?: string,
) {
  return userFormSchema.superRefine((values, context) => {
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
      hasDuplicateEmail(directory, values.email, exceptUserId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "A user with this email is already in the sample list.",
      });
    }

    const foreignTeam = values.teamIds.some((teamId) => {
      const team = directory.teams.find((item) => item.id === teamId);
      return !team || team.organizationId !== values.organizationId;
    });

    if (
      values.role.length > 0 &&
      !directory.roles.some((role) => role.name === values.role)
    ) {
      context.addIssue({
        code: "custom",
        path: ["role"],
        message: "Select a role.",
      });
    }

    if (foreignTeam) {
      context.addIssue({
        code: "custom",
        path: ["teamIds"],
        message: "Select teams from this organization only.",
      });
    }
  });
}

export const emptyUserForm: UserFormValues = {
  name: "",
  email: "",
  organizationId: "",
  role: "Physician",
  teamIds: [],
  status: "Active",
};
