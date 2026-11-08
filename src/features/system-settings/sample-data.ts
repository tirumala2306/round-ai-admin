import type { SystemSettings } from "@/features/system-settings/types";

/**
 * Sample workspace preferences for this browser session.
 * Seeded from the Harborlight Family Clinic display details.
 * Saving a section does not rename the organization record or change sign-in.
 */
export const sampleSystemSettings: SystemSettings = {
  general: {
    hospitalName: "Harborlight Family Clinic",
    displayName: "Harborlight Clinic",
    contactEmail: "front-desk@harborlight-clinic.example",
    contactPhone: "(206) 555-0133",
    website: "https://harborlight-clinic.example",
    address: "220 Lakeside Way, Seattle, Washington",
    logoMark: "monogram",
    updatedAt: "2026-03-02",
  },
  preferences: {
    language: "English",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    timezone: "America/Los_Angeles",
    landingPage: "/dashboard",
    updatedAt: "2026-03-02",
  },
  session: {
    sessionTimeoutMinutes: 30,
    automaticLogout: true,
    maxConcurrentSessions: 2,
    loginNotifications: true,
    updatedAt: "2026-03-02",
  },
  security: {
    minPasswordLength: 12,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialCharacters: true,
    passwordExpiration: "90",
    loginFailureWarningThreshold: 5,
    updatedAt: "2026-03-02",
  },
  clinical: {
    defaultWorkflow: "Admission",
    defaultTemplateId: "tpl-har-admission",
    clinicalReviewReminders: true,
    pendingTaskReminders: true,
    aiReviewPreference: "Remind before use",
    updatedAt: "2026-03-02",
  },
};
