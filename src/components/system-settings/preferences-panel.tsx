"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  ReadOnlyNote,
  SettingsNotice,
  SettingsPanel,
  SettingsSelect,
} from "@/components/system-settings/settings-fields";
import { useSettingsSave } from "@/components/system-settings/use-settings-save";
import { Button } from "@/components/ui/button";
import { applicationPreferencesSchema } from "@/features/system-settings/schema";
import {
  dateFormats,
  landingPageHrefs,
  landingPageLabels,
  preferenceLanguages,
  timeFormats,
  timezones,
  type ApplicationPreferences,
  type ApplicationPreferencesFormValues,
} from "@/features/system-settings/types";
import { updateApplicationPreferences } from "@/features/organizations/demo-store";

export function PreferencesPanel({
  preferences,
  canEdit,
}: {
  preferences: ApplicationPreferences;
  canEdit: boolean;
}) {
  const save = useSettingsSave(
    updateApplicationPreferences,
    "Application preferences were saved for this sample.",
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationPreferencesFormValues>({
    resolver: zodResolver(applicationPreferencesSchema),
    defaultValues: {
      language: preferences.language,
      dateFormat: preferences.dateFormat,
      timeFormat: preferences.timeFormat,
      timezone: preferences.timezone,
      landingPage: preferences.landingPage,
    },
  });

  return (
    <SettingsPanel
      title="Application Preferences"
      description="Display choices for language, dates, and the preferred landing page."
      updatedAt={preferences.updatedAt}
    >
      <form className="grid gap-4" onSubmit={handleSubmit((values) => save.requestSave(values, false))}>
        <SettingsNotice>
          The landing page preference is stored for this session. Signing in still opens the dashboard.
        </SettingsNotice>
        <fieldset className="grid gap-4 sm:grid-cols-2" disabled={!canEdit}>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <SettingsSelect
                id="pref-language"
                label="Default language"
                value={field.value}
                required
                disabled={!canEdit}
                error={errors.language?.message}
                options={preferenceLanguages.map((language) => ({ value: language, label: language }))}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="dateFormat"
            control={control}
            render={({ field }) => (
              <SettingsSelect
                id="pref-date"
                label="Date format"
                value={field.value}
                required
                disabled={!canEdit}
                error={errors.dateFormat?.message}
                options={dateFormats.map((format) => ({ value: format, label: format }))}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="timeFormat"
            control={control}
            render={({ field }) => (
              <SettingsSelect
                id="pref-time"
                label="Time format"
                value={field.value}
                required
                disabled={!canEdit}
                error={errors.timeFormat?.message}
                options={timeFormats.map((format) => ({ value: format, label: format }))}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <SettingsSelect
                id="pref-timezone"
                label="Timezone"
                value={field.value}
                required
                disabled={!canEdit}
                error={errors.timezone?.message}
                options={timezones.map((zone) => ({ value: zone, label: zone }))}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="landingPage"
            control={control}
            render={({ field }) => (
              <SettingsSelect
                id="pref-landing"
                label="Default dashboard landing page"
                value={field.value}
                required
                disabled={!canEdit}
                error={errors.landingPage?.message}
                hint="Stored as a sample preference. It does not change the page opened after sign-in."
                options={landingPageHrefs.map((href) => ({ value: href, label: landingPageLabels[href] }))}
                onChange={field.onChange}
              />
            )}
          />
        </fieldset>
        {canEdit ? (
          <div>
            <Button type="submit">Save application preferences</Button>
          </div>
        ) : (
          <ReadOnlyNote />
        )}
      </form>
    </SettingsPanel>
  );
}
