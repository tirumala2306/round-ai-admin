"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import { SettingsConfirmDialog } from "@/components/system-settings/confirm-dialog";
import {
  ReadOnlyNote,
  SettingsCheck,
  SettingsNotice,
  SettingsPanel,
  SettingsSelect,
} from "@/components/system-settings/settings-fields";
import { useSettingsSave } from "@/components/system-settings/use-settings-save";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { securitySettingsSchema } from "@/features/system-settings/schema";
import {
  passwordExpirationLabels,
  passwordExpirationPreferences,
  type SecuritySettings,
  type SecuritySettingsFormValues,
} from "@/features/system-settings/types";
import { updateSecuritySettings } from "@/features/organizations/demo-store";

export function SecuritySettingsPanel({
  security,
  canEdit,
}: {
  security: SecuritySettings;
  canEdit: boolean;
}) {
  const save = useSettingsSave(
    updateSecuritySettings,
    "Security preferences were saved for this sample. Password checks were not changed.",
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      minPasswordLength: security.minPasswordLength,
      requireUppercase: security.requireUppercase,
      requireNumbers: security.requireNumbers,
      requireSpecialCharacters: security.requireSpecialCharacters,
      passwordExpiration: security.passwordExpiration,
      loginFailureWarningThreshold: security.loginFailureWarningThreshold,
    },
  });

  return (
    <SettingsPanel
      title="Security Settings"
      description="Intended password and sign-in warning preferences for this demo."
      updatedAt={security.updatedAt}
    >
      <form className="grid gap-4" onSubmit={handleSubmit((values) => save.requestSave(values, true))}>
        <SettingsNotice>
          These values record an intended policy for this demo. They do not change sign-in, password reset, or account
          lockout.
        </SettingsNotice>
        <fieldset className="grid gap-4" disabled={!canEdit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Minimum password length"
              htmlFor="security-length"
              error={errors.minPasswordLength?.message}
              required
              hint="From 8 to 128 characters. The demo sign-in check is unchanged."
            >
              <Input
                id="security-length"
                type="number"
                inputMode="numeric"
                aria-invalid={Boolean(errors.minPasswordLength)}
                {...register("minPasswordLength", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Login failure warning threshold"
              htmlFor="security-threshold"
              error={errors.loginFailureWarningThreshold?.message}
              required
              hint="A positive whole number, up to 20. No account is locked."
            >
              <Input
                id="security-threshold"
                type="number"
                inputMode="numeric"
                aria-invalid={Boolean(errors.loginFailureWarningThreshold)}
                {...register("loginFailureWarningThreshold", { valueAsNumber: true })}
              />
            </FormField>
            <Controller
              name="passwordExpiration"
              control={control}
              render={({ field }) => (
                <SettingsSelect
                  id="security-expiration"
                  label="Password expiration preference"
                  value={field.value}
                  required
                  disabled={!canEdit}
                  error={errors.passwordExpiration?.message}
                  hint="Records the preferred interval. Passwords do not expire in this demo."
                  options={passwordExpirationPreferences.map((value) => ({
                    value,
                    label: passwordExpirationLabels[value],
                  }))}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <SettingsCheck
            id="security-upper"
            label="Require uppercase letters"
            detail="Records that an intended password should include an uppercase letter."
            disabled={!canEdit}
            registration={register("requireUppercase")}
          />
          <SettingsCheck
            id="security-number"
            label="Require numbers"
            detail="Records that an intended password should include a number."
            disabled={!canEdit}
            registration={register("requireNumbers")}
          />
          <SettingsCheck
            id="security-special"
            label="Require special characters"
            detail="Records that an intended password should include a special character."
            disabled={!canEdit}
            registration={register("requireSpecialCharacters")}
          />
        </fieldset>
        {canEdit ? (
          <div>
            <Button type="submit">Save security settings</Button>
          </div>
        ) : (
          <ReadOnlyNote />
        )}
      </form>
      <SettingsConfirmDialog
        open={save.confirming}
        title="Save security settings?"
        description="This updates the sample security preferences in this browser session. It does not enforce passwords or lock accounts."
        confirmLabel="Save settings"
        onOpenChange={(open) => {
          if (!open) {
            save.cancelConfirm();
          }
        }}
        onConfirm={save.confirmSave}
      />
    </SettingsPanel>
  );
}
