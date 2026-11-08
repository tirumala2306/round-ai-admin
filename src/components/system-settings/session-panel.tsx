"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import { SettingsConfirmDialog } from "@/components/system-settings/confirm-dialog";
import {
  ReadOnlyNote,
  SettingsCheck,
  SettingsNotice,
  SettingsPanel,
} from "@/components/system-settings/settings-fields";
import { useSettingsSave } from "@/components/system-settings/use-settings-save";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sessionSettingsSchema } from "@/features/system-settings/schema";
import type { SessionSettings, SessionSettingsFormValues } from "@/features/system-settings/types";
import { updateSessionSettings } from "@/features/organizations/demo-store";

export function SessionSettingsPanel({
  session,
  canEdit,
}: {
  session: SessionSettings;
  canEdit: boolean;
}) {
  const save = useSettingsSave(
    updateSessionSettings,
    "Session preferences were saved for this sample. The current sign-in was not changed.",
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionSettingsFormValues>({
    resolver: zodResolver(sessionSettingsSchema),
    defaultValues: {
      sessionTimeoutMinutes: session.sessionTimeoutMinutes,
      automaticLogout: session.automaticLogout,
      maxConcurrentSessions: session.maxConcurrentSessions,
      loginNotifications: session.loginNotifications,
    },
  });

  return (
    <SettingsPanel
      title="User & Session Settings"
      description="Sample session preferences. Nothing here signs a person out or starts a timer."
      updatedAt={session.updatedAt}
    >
      <form className="grid gap-4" onSubmit={handleSubmit((values) => save.requestSave(values, true))}>
        <SettingsNotice>
          These values are stored as sample preferences. They do not change the current sign-in session, start a
          timeout, or sign anyone out.
        </SettingsNotice>
        <fieldset className="grid gap-4" disabled={!canEdit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Session timeout (minutes)"
              htmlFor="session-timeout"
              error={errors.sessionTimeoutMinutes?.message}
              required
              hint="A positive whole number of minutes, up to 1,440."
            >
              <Input
                id="session-timeout"
                type="number"
                inputMode="numeric"
                aria-invalid={Boolean(errors.sessionTimeoutMinutes)}
                {...register("sessionTimeoutMinutes", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Maximum concurrent sessions"
              htmlFor="session-max"
              error={errors.maxConcurrentSessions?.message}
              required
              hint="A positive whole number, up to 20."
            >
              <Input
                id="session-max"
                type="number"
                inputMode="numeric"
                aria-invalid={Boolean(errors.maxConcurrentSessions)}
                {...register("maxConcurrentSessions", { valueAsNumber: true })}
              />
            </FormField>
          </div>
          <SettingsCheck
            id="session-logout"
            label="Automatic logout preference"
            detail="Records that this demo workspace prefers an automatic sign-out after the timeout. It does not sign anyone out."
            disabled={!canEdit}
            registration={register("automaticLogout")}
          />
          <SettingsCheck
            id="session-notify"
            label="Login notification preference"
            detail="Records that a sign-in notice is preferred. No notification is sent."
            disabled={!canEdit}
            registration={register("loginNotifications")}
          />
        </fieldset>
        {canEdit ? (
          <div>
            <Button type="submit">Save session settings</Button>
          </div>
        ) : (
          <ReadOnlyNote />
        )}
      </form>
      <SettingsConfirmDialog
        open={save.confirming}
        title="Save session settings?"
        description="This updates the sample session preferences in this browser session. It does not change authentication or sign anyone out."
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
