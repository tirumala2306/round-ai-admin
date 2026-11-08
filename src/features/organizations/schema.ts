import { z } from "zod";
import { hasDuplicateOrganizationName } from "@/features/organizations/selectors";
import type { OrganizationDirectory } from "@/features/organizations/types";
import {
  organizationStatuses,
  organizationTypes,
  type OrganizationFormValues,
} from "@/features/organizations/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+().\-\s]{7,30}$/;

export const organizationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter the organization name.")
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  type: z.enum(organizationTypes, "Select an organization type."),
  email: z
    .string()
    .trim()
    .max(120, "Use 120 characters or fewer.")
    .refine(
      (value) => value === "" || emailPattern.test(value),
      "Enter a valid email address.",
    ),
  phone: z
    .string()
    .trim()
    .max(30, "Use 30 characters or fewer.")
    .refine(
      (value) =>
        value === "" ||
        (phonePattern.test(value) && value.replace(/\D/g, "").length >= 7),
      "Enter a valid phone number.",
    ),
  country: z.string().trim().max(80, "Use 80 characters or fewer."),
  state: z.string().trim().max(80, "Use 80 characters or fewer."),
  city: z.string().trim().max(80, "Use 80 characters or fewer."),
  address: z.string().trim().max(160, "Use 160 characters or fewer."),
  website: z
    .string()
    .trim()
    .max(200, "Use 200 characters or fewer.")
    .refine((value) => {
      if (value === "") {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a full website address, such as https://example.org."),
  status: z.enum(organizationStatuses, "Select a status."),
});

export function createOrganizationFormSchema(
  directory: OrganizationDirectory,
  exceptOrganizationId?: string,
) {
  return organizationFormSchema.superRefine((values, context) => {
    if (
      hasDuplicateOrganizationName(
        directory,
        values.name,
        exceptOrganizationId,
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "An organization with this name is already in the sample list.",
      });
    }
  });
}

export const emptyOrganizationForm: OrganizationFormValues = {
  name: "",
  type: "Hospital",
  email: "",
  phone: "",
  country: "United States",
  state: "",
  city: "",
  address: "",
  website: "",
  status: "Active",
};
