"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormField } from "@/components/ai-configuration/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAiModelSchema, emptyAiModelForm } from "@/features/ai-configuration/schema";
import { toModelFormValues } from "@/features/ai-configuration/selectors";
import {
  aiCapabilities,
  aiConfigStatuses,
  type AiCapability,
  type AiConfiguration,
  type AiModel,
  type AiModelFormValues,
} from "@/features/ai-configuration/types";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function ModelFormDialog({
  open,
  mode,
  model,
  config,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  model?: AiModel;
  config: AiConfiguration;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AiModelFormValues) => boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          releaseOrganizationWrite();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[min(44rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {open ? (
          <ModelForm
            key={`${mode}-${model?.id ?? "new"}`}
            mode={mode}
            model={model}
            config={config}
            onCancel={() => {
              releaseOrganizationWrite();
              onOpenChange(false);
            }}
            onSubmit={onSubmit}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ModelForm({
  mode,
  model,
  config,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  model?: AiModel;
  config: AiConfiguration;
  onCancel: () => void;
  onSubmit: (values: AiModelFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [pendingPause, setPendingPause] = useState(false);
  const schema = createAiModelSchema(config, model?.id);
  const providers = [...config.providers].sort((left, right) => left.name.localeCompare(right.name));
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AiModelFormValues>({
    resolver: zodResolver(schema),
    defaultValues: model ? toModelFormValues(model) : emptyAiModelForm(),
    mode: "onTouched",
  });
  const providerName = providers.find((provider) => provider.id === model?.providerId)?.name;

  function submit(values: AiModelFormValues) {
    if (mode === "edit" && model?.status === "Active" && values.status === "Inactive" && !pendingPause) {
      setPendingPause(true);
      return;
    }
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      return;
    }
    setSubmitting(true);
    const saved = onSubmit(values);
    if (!saved) {
      releaseOrganizationWrite();
      setSubmitting(false);
      setPendingPause(false);
    }
  }

  return (
    <form autoComplete="off" className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit(submit)}>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <DialogHeader className="pr-8">
          <DialogTitle>{mode === "add" ? "Add sample model" : "Edit sample model"}</DialogTitle>
          <DialogDescription>
            {pendingPause
              ? "Pausing this model keeps it in the sample catalog and blocks new task assignments."
              : "Model names in this catalog are sample configuration data, not a live provider inventory."}
          </DialogDescription>
        </DialogHeader>
        {pendingPause ? null : (
          <div className="mt-4 grid gap-4">
            {mode === "edit" ? (
              <FormField label="Provider" htmlFor="model-provider-locked">
                <Input id="model-provider-locked" value={providerName ?? "Unknown provider"} readOnly />
              </FormField>
            ) : (
              <FormField label="Provider" htmlFor="model-provider" error={errors.providerId?.message} required>
                <Controller
                  name="providerId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || "unselected"} onValueChange={field.onChange}>
                      <SelectTrigger id="model-provider" className="w-full">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.status === "Inactive" ? `${provider.name} (Inactive)` : provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            )}
            <FormField label="Model name" htmlFor="model-name" error={errors.name?.message} required>
              <Input id="model-name" {...register("name")} />
            </FormField>
            <FormField label="Description" htmlFor="model-description" error={errors.description?.message} required>
              <Textarea id="model-description" rows={3} {...register("description")} />
            </FormField>
            <FormField
              label="Supported capabilities"
              htmlFor="model-capabilities"
              error={errors.capabilities?.message}
              required
              hint="Tasks can use this model only when it lists the capability they need."
            >
              <Controller
                name="capabilities"
                control={control}
                render={({ field }) => (
                  <fieldset id="model-capabilities" className="grid gap-2 sm:grid-cols-2">
                    <legend className="sr-only">Supported capabilities</legend>
                    {aiCapabilities.map((capability) => (
                      <label key={capability} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={field.value.includes(capability)}
                          onChange={(event) => {
                            const next: AiCapability[] = event.target.checked
                              ? [...field.value, capability]
                              : field.value.filter((item) => item !== capability);
                            field.onChange(next);
                          }}
                        />
                        {capability}
                      </label>
                    ))}
                  </fieldset>
                )}
              />
            </FormField>
            <FormField label="Status" htmlFor="model-status" error={errors.status?.message} required>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="model-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiConfigStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>
        )}
      </div>
      <DialogFooter className="border-t border-border px-4 py-3">
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => {
            if (pendingPause) {
              setPendingPause(false);
              return;
            }
            onCancel();
          }}
        >
          {pendingPause ? "Back" : "Cancel"}
        </Button>
        <Button type="submit" disabled={submitting}>
          {pendingPause ? "Pause model" : mode === "add" ? "Add model" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
