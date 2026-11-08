import { Settings } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const systemSettingsModule = {
  title: "System Settings",
  href: "/system-settings",
  icon: Settings,
  description: "Sample workspace preferences for this demo.",
  summary:
    "Review and edit sample workspace preferences for this browser session. These values do not change sign-in, password checks, clinical enforcement, or AI configuration. Refreshing the page restores the original sample settings.",
  emptyTitle: "No settings to change",
  emptyDescription: "Workspace preferences in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;

export { sampleSystemSettings } from "@/features/system-settings/sample-data";
export {
  applicationPreferencesSchema,
  createClinicalSettingsSchema,
  generalSettingsSchema,
  securitySettingsSchema,
  sessionSettingsSchema,
} from "@/features/system-settings/schema";
export { clinicalTemplateIssue, templateChoices } from "@/features/system-settings/selectors";
export {
  aboutProduct,
  aiReviewPreferences,
  dateFormats,
  landingPageHrefs,
  landingPageLabels,
  logoMarks,
  passwordExpirationLabels,
  passwordExpirationPreferences,
  preferenceLanguages,
  systemSettingsEditPermissionId,
  systemSettingsViewPermissionId,
  timeFormats,
  timezones,
} from "@/features/system-settings/types";
