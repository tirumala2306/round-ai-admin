import { z } from "zod";
import { clinicalTemplateWorkflows } from "@/features/clinical-templates/types";
import type { ClinicalTemplate } from "@/features/clinical-templates/types";
import { clinicalTemplateIssue } from "@/features/system-settings/selectors";
import {
  aiReviewPreferences,
  dateFormats,
  landingPageHrefs,
  logoMarks,
  passwordExpirationPreferences,
  preferenceLanguages,
  timeFormats,
  timezones,
} from "@/features/system-settings/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+().\-\s]{7,30}$/;

const logoMarkValues = logoMarks.map((mark) => mark.value) as [
  (typeof logoMarks)[number]["value"],
  ...(typeof logoMarks)[number]["value"][],
];

function websiteIssue(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const generalSettingsSchema = z.object({
  hospitalName: z
    .string()
    .trim()
    .min(1, "Enter the hospital name.")
    .min(2, "Enter at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  displayName: z
    .string()
    .trim()
    .min(1, "Enter the display name.")
    .min(2, "Enter at least 2 characters.")
    .max(80, "Use 80 characters or fewer."),
  contactEmail: z
    .string()
    .trim()
    .min(1, "Enter a contact email.")
    .max(120, "Use 120 characters or fewer.")
    .refine((value) => emailPattern.test(value), "Enter a valid email address."),
  contactPhone: z
    .string()
    .trim()
    .min(1, "Enter a contact phone number.")
    .max(30, "Use 30 characters or fewer.")
    .refine(
      (value) => phonePattern.test(value) && value.replace(/\D/g, "").length >= 7,
      "Enter a valid phone number.",
    ),
  website: z
    .string()
    .trim()
    .min(1, "Enter the hospital website.")
    .max(200, "Use 200 characters or fewer.")
    .refine(websiteIssue, "Enter a full website address, such as https://example.org."),
  address: z
    .string()
    .trim()
    .min(1, "Enter the address.")
    .max(160, "Use 160 characters or fewer."),
  logoMark: z.enum(logoMarkValues, "Select a logo preview."),
});

export const applicationPreferencesSchema = z.object({
  language: z.enum(preferenceLanguages, "Select a language."),
  dateFormat: z.enum(dateFormats, "Select a date format."),
  timeFormat: z.enum(timeFormats, "Select a time format."),
  timezone: z.enum(timezones, "Select a timezone."),
  landingPage: z.enum(landingPageHrefs, "Select a landing page."),
});

export const sessionSettingsSchema = z.object({
  sessionTimeoutMinutes: z
    .number({ error: "Enter a session timeout in minutes." })
    .int("Enter a whole number of minutes.")
    .positive("Enter a session timeout of at least 1 minute.")
    .max(1440, "Use 1,440 minutes or fewer."),
  automaticLogout: z.boolean(),
  maxConcurrentSessions: z
    .number({ error: "Enter the maximum concurrent sessions." })
    .int("Enter a whole number of sessions.")
    .positive("Enter at least 1 concurrent session.")
    .max(20, "Use 20 concurrent sessions or fewer."),
  loginNotifications: z.boolean(),
});

export const securitySettingsSchema = z.object({
  minPasswordLength: z
    .number({ error: "Enter a minimum password length." })
    .int("Enter a whole number of characters.")
    .min(8, "Use at least 8 characters.")
    .max(128, "Use 128 characters or fewer."),
  requireUppercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialCharacters: z.boolean(),
  passwordExpiration: z.enum(passwordExpirationPreferences, "Select a password expiration preference."),
  loginFailureWarningThreshold: z
    .number({ error: "Enter a login failure warning threshold." })
    .int("Enter a whole number.")
    .positive("Enter a threshold of at least 1.")
    .max(20, "Use 20 or fewer."),
});

const clinicalObject = z.object({
  defaultWorkflow: z.enum(clinicalTemplateWorkflows, "Select a clinical workflow."),
  defaultTemplateId: z.string().min(1, "Select a clinical template."),
  clinicalReviewReminders: z.boolean(),
  pendingTaskReminders: z.boolean(),
  aiReviewPreference: z.enum(aiReviewPreferences, "Select an AI review preference."),
});

export function createClinicalSettingsSchema(templates: ClinicalTemplate[], organizationId: string) {
  return clinicalObject.superRefine((values, context) => {
    const message = clinicalTemplateIssue(templates, organizationId, values);
    if (message) {
      context.addIssue({ code: "custom", path: ["defaultTemplateId"], message });
    }
  });
}
