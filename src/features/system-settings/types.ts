import type { ClinicalTemplateWorkflow } from "@/features/clinical-templates/types";

/** Existing permissions. Hospital Admin receives both. Physician and Clinical Staff can view only. */
export const systemSettingsViewPermissionId = "settings.view";
export const systemSettingsEditPermissionId = "settings.general";

export const logoMarks = [
  { value: "monogram", label: "Harborlight monogram", letters: "HL" },
  { value: "rounds", label: "RoundsAI mark", letters: "RA" },
  { value: "clinic", label: "Clinic initials", letters: "HC" },
] as const;

export const preferenceLanguages = ["English", "Spanish", "French"] as const;

export const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;

export const timeFormats = ["12-hour", "24-hour"] as const;

export const timezones = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Phoenix",
  "Pacific/Honolulu",
  "UTC",
] as const;

export const landingPageHrefs = [
  "/dashboard",
  "/organizations",
  "/clinical-templates",
  "/knowledge-base",
  "/ai-monitoring",
] as const;

export const landingPageLabels: Record<(typeof landingPageHrefs)[number], string> = {
  "/dashboard": "Dashboard",
  "/organizations": "Organizations",
  "/clinical-templates": "Clinical Templates",
  "/knowledge-base": "Knowledge Base",
  "/ai-monitoring": "AI Monitoring",
};

export const passwordExpirationPreferences = ["never", "30", "60", "90", "180"] as const;

export const passwordExpirationLabels: Record<(typeof passwordExpirationPreferences)[number], string> = {
  never: "No expiration",
  "30": "30 days",
  "60": "60 days",
  "90": "90 days",
  "180": "180 days",
};

export const aiReviewPreferences = ["Remind before use", "Show as optional", "No reminder"] as const;

export const aboutProduct = {
  productName: "RoundsAI",
  version: "0.9.0-demo",
  environment: "Demo",
  copyright: "© 2026 RoundsAI. Demonstration copy for this admin panel.",
  build: "demo-local.2026.11.07",
} as const;

export type LogoMark = (typeof logoMarks)[number]["value"];
export type PreferenceLanguage = (typeof preferenceLanguages)[number];
export type DateFormat = (typeof dateFormats)[number];
export type TimeFormat = (typeof timeFormats)[number];
export type TimezoneId = (typeof timezones)[number];
export type LandingPageHref = (typeof landingPageHrefs)[number];
export type PasswordExpirationPreference = (typeof passwordExpirationPreferences)[number];
export type AiReviewPreference = (typeof aiReviewPreferences)[number];

export type GeneralSettings = {
  hospitalName: string;
  displayName: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  logoMark: LogoMark;
  updatedAt: string;
};

export type ApplicationPreferences = {
  language: PreferenceLanguage;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timezone: TimezoneId;
  landingPage: LandingPageHref;
  updatedAt: string;
};

export type SessionSettings = {
  sessionTimeoutMinutes: number;
  automaticLogout: boolean;
  maxConcurrentSessions: number;
  loginNotifications: boolean;
  updatedAt: string;
};

export type SecuritySettings = {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialCharacters: boolean;
  passwordExpiration: PasswordExpirationPreference;
  loginFailureWarningThreshold: number;
  updatedAt: string;
};

export type ClinicalWorkflowSettings = {
  defaultWorkflow: ClinicalTemplateWorkflow;
  defaultTemplateId: string;
  clinicalReviewReminders: boolean;
  pendingTaskReminders: boolean;
  aiReviewPreference: AiReviewPreference;
  updatedAt: string;
};

export type SystemSettings = {
  general: GeneralSettings;
  preferences: ApplicationPreferences;
  session: SessionSettings;
  security: SecuritySettings;
  clinical: ClinicalWorkflowSettings;
};

export type GeneralSettingsFormValues = Omit<GeneralSettings, "updatedAt">;
export type ApplicationPreferencesFormValues = Omit<ApplicationPreferences, "updatedAt">;
export type SessionSettingsFormValues = Omit<SessionSettings, "updatedAt">;
export type SecuritySettingsFormValues = Omit<SecuritySettings, "updatedAt">;
export type ClinicalWorkflowFormValues = Omit<ClinicalWorkflowSettings, "updatedAt">;

export type SystemSettingsWriteResult = { ok: true } | { ok: false; message: string };

export type SystemSettingsSectionId =
  | "general"
  | "preferences"
  | "session"
  | "security"
  | "clinical"
  | "about";
