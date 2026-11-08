"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import {
  LogoPreview,
  ReadOnlyNote,
  SettingsNotice,
  SettingsPanel,
  SettingsSelect,
} from "@/components/system-settings/settings-fields";
import { useSettingsSave } from "@/components/system-settings/use-settings-save";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { generalSettingsSchema } from "@/features/system-settings/schema";
import {
  logoMarks,
  type GeneralSettings,
  type GeneralSettingsFormValues,
} from "@/features/system-settings/types";
import { updateGeneralSettings } from "@/features/organizations/demo-store";

export function GeneralSettingsPanel({
  general,
  canEdit,
}: {
  general: GeneralSettings;
  canEdit: boolean;
}) {
  const save = useSettingsSave(
    updateGeneralSettings,
    "General settings were saved for this sample.",
  );
  const [logoMark, setLogoMark] = useState(general.logoMark);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      hospitalName: general.hospitalName,
      displayName: general.displayName,
      contactEmail: general.contactEmail,
      contactPhone: general.contactPhone,
      website: general.website,
      address: general.address,
      logoMark: general.logoMark,
    },
  });

  return (
    <SettingsPanel
      title="General Settings"
      description="Display details for this demo workspace."
      updatedAt={general.updatedAt}
    >
      <form className="grid gap-4" onSubmit={handleSubmit((values) => save.requestSave(values, false))}>
        <SettingsNotice>
          Hospital details here are display preferences for this session. They do not rename the organization record.
        </SettingsNotice>
        <LogoPreview mark={logoMark} />
        <fieldset className="grid gap-4 sm:grid-cols-2" disabled={!canEdit}>
          <FormField label="Hospital name" htmlFor="hospital-name" error={errors.hospitalName?.message} required>
            <Input id="hospital-name" aria-invalid={Boolean(errors.hospitalName)} {...register("hospitalName")} />
          </FormField>
          <FormField label="Hospital display name" htmlFor="display-name" error={errors.displayName?.message} required>
            <Input id="display-name" aria-invalid={Boolean(errors.displayName)} {...register("displayName")} />
          </FormField>
          <FormField label="Contact email" htmlFor="contact-email" error={errors.contactEmail?.message} required>
            <Input
              id="contact-email"
              type="text"
              inputMode="email"
              autoComplete="off"
              aria-invalid={Boolean(errors.contactEmail)}
              {...register("contactEmail")}
            />
          </FormField>
          <FormField label="Contact phone" htmlFor="contact-phone" error={errors.contactPhone?.message} required>
            <Input id="contact-phone" type="tel" aria-invalid={Boolean(errors.contactPhone)} {...register("contactPhone")} />
          </FormField>
          <FormField label="Hospital website" htmlFor="hospital-website" error={errors.website?.message} required>
            <Input id="hospital-website" aria-invalid={Boolean(errors.website)} {...register("website")} />
          </FormField>
          <Controller
            name="logoMark"
            control={control}
            render={({ field }) => (
              <SettingsSelect
                id="logo-mark"
                label="Logo preview"
                value={field.value}
                required
                disabled={!canEdit}
                error={errors.logoMark?.message}
                options={logoMarks.map((mark) => ({ value: mark.value, label: mark.label }))}
                onChange={(value) => {
                  const mark = logoMarks.find((item) => item.value === value);
                  if (!mark) {
                    return;
                  }
                  field.onChange(mark.value);
                  setLogoMark(mark.value);
                }}
              />
            )}
          />
          <div className="sm:col-span-2">
            <FormField label="Address" htmlFor="hospital-address" error={errors.address?.message} required>
              <Textarea id="hospital-address" rows={2} aria-invalid={Boolean(errors.address)} {...register("address")} />
            </FormField>
          </div>
        </fieldset>
        {canEdit ? (
          <div>
            <Button type="submit">Save general settings</Button>
          </div>
        ) : (
          <ReadOnlyNote />
        )}
      </form>
    </SettingsPanel>
  );
}
