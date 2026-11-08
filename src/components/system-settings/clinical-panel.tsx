"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import { clinicalTemplateWorkflows, type ClinicalTemplate } from "@/features/clinical-templates/types";
import { createClinicalSettingsSchema } from "@/features/system-settings/schema";
import { templateChoices } from "@/features/system-settings/selectors";
import {
  aiReviewPreferences,
  type ClinicalWorkflowSettings,
  type ClinicalWorkflowFormValues,
} from "@/features/system-settings/types";
import { updateClinicalWorkflowSettings } from "@/features/organizations/demo-store";

export function ClinicalSettingsPanel({
  clinical,
  templates,
  organizationId,
  canEdit,
}: {
  clinical: ClinicalWorkflowSettings;
  templates: ClinicalTemplate[];
  organizationId: string;
  canEdit: boolean;
}) {
  const choices = templateChoices(templates, organizationId, clinical.defaultTemplateId);
  const save = useSettingsSave(
    (values: ClinicalWorkflowFormValues) => updateClinicalWorkflowSettings(organizationId, values),
    "Clinical workflow preferences were saved for this sample. Templates and AI configuration were not changed.",
  );
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicalWorkflowFormValues>({
    resolver: zodResolver(createClinicalSettingsSchema(templates, organizationId)),
    defaultValues: {
      defaultWorkflow: clinical.defaultWorkflow,
      defaultTemplateId: clinical.defaultTemplateId,
      clinicalReviewReminders: clinical.clinicalReviewReminders,
      pendingTaskReminders: clinical.pendingTaskReminders,
      aiReviewPreference: clinical.aiReviewPreference,
    },
  });

  return (
    <SettingsPanel
      title="Clinical Workflow Settings"
      description="Administrative preferences that point at existing workflows and templates."
      updatedAt={clinical.updatedAt}
    >
      {choices.length === 0 ? (
        <p className="text-sm leading-6 text-muted-foreground">
          No active clinical template is available for this organization.
        </p>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit((values) => save.requestSave(values, true))}>
          <SettingsNotice>
            These preferences do not edit clinical templates, do not change AI Configuration, and do not enforce a
            clinical workflow.
          </SettingsNotice>
          <fieldset className="grid gap-4" disabled={!canEdit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="defaultWorkflow"
                control={control}
                render={({ field }) => (
                  <SettingsSelect
                    id="clinical-workflow"
                    label="Default clinical workflow"
                    value={field.value}
                    required
                    disabled={!canEdit}
                    error={errors.defaultWorkflow?.message}
                    options={clinicalTemplateWorkflows.map((workflow) => ({ value: workflow, label: workflow }))}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="defaultTemplateId"
                control={control}
                render={({ field }) => (
                  <SettingsSelect
                    id="clinical-template"
                    label="Default note template"
                    value={field.value}
                    required
                    disabled={!canEdit}
                    error={errors.defaultTemplateId?.message}
                    hint="Choices come from this organization's clinical templates."
                    options={choices}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="aiReviewPreference"
                control={control}
                render={({ field }) => (
                  <SettingsSelect
                    id="clinical-ai-review"
                    label="Default AI-generated content review preference"
                    value={field.value}
                    required
                    disabled={!canEdit}
                    error={errors.aiReviewPreference?.message}
                    hint="This does not change the AI Configuration safety settings."
                    options={aiReviewPreferences.map((preference) => ({ value: preference, label: preference }))}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <SettingsCheck
              id="clinical-review-reminder"
              label="Enable clinical review reminders"
              detail="Records that a reminder is preferred before a sample review. No reminder is sent."
              disabled={!canEdit}
              registration={register("clinicalReviewReminders")}
            />
            <SettingsCheck
              id="clinical-task-reminder"
              label="Enable pending-task reminders"
              detail="Records that a reminder is preferred for pending sample tasks. No task list is changed."
              disabled={!canEdit}
              registration={register("pendingTaskReminders")}
            />
          </fieldset>
          {canEdit ? (
            <div>
              <Button type="submit">Save clinical workflow settings</Button>
            </div>
          ) : (
            <ReadOnlyNote />
          )}
        </form>
      )}
      <SettingsConfirmDialog
        open={save.confirming}
        title="Save clinical workflow settings?"
        description="This updates the sample workflow preferences in this browser session. It does not change templates, AI configuration, or clinical enforcement."
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
