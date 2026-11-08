import { z } from "zod";
import { hasDuplicateRoleName } from "@/features/roles/selectors";
import type { RoleFormValues } from "@/features/roles/types";
import type { OrganizationDirectory } from "@/features/organizations/types";

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the role name.")
    .min(2, "Enter at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Enter a description.")
    .max(240, "Use 240 characters or fewer."),
  permissionIds: z.array(z.string()),
});

export function createRoleFormSchema(
  directory: OrganizationDirectory,
  exceptRoleId?: string,
) {
  return roleFormSchema.superRefine((values, context) => {
    if (hasDuplicateRoleName(directory, values.name, exceptRoleId)) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "A role with this name is already in the sample list.",
      });
    }
  });
}

export const emptyRoleForm: RoleFormValues = {
  name: "",
  description: "",
  permissionIds: [],
};
