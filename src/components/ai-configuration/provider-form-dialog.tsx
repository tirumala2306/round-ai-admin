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
import { createAiProviderSchema, emptyAiProviderForm } from "@/features/ai-configuration/schema";
import { modelsForProvider, toProviderFormValues } from "@/features/ai-configuration/selectors";
import {
  aiConfigStatuses,
  aiProviderTypes,
  type AiConfiguration,
  type AiProvider,
  type AiProviderFormValues,
} from "@/features/ai-configuration/types";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function ProviderFormDialog({
  open,
  mode,
  provider,
  config,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  provider?: AiProvider;
  config: AiConfiguration;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AiProviderFormValues) => boolean;
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
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {open ? (
          <ProviderForm
            key={`${mode}-${provider?.id ?? "new"}`}
            mode={mode}
            provider={provider}
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

function ProviderForm({
  mode,
  provider,
  config,
  onCancel,
  onSubmit,
}: {
  mode: "add" | "edit";
  provider?: AiProvider;
  config: AiConfiguration;
  onCancel: () => void;
  onSubmit: (values: AiProviderFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [pendingPause, setPendingPause] = useState(false);
  const schema = createAiProviderSchema(config, provider?.id);
  const models = provider ? modelsForProvider(config, provider.id) : [];
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AiProviderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: provider ? toProviderFormValues(provider) : emptyAiProviderForm(),
    mode: "onTouched",
  });

  function submit(values: AiProviderFormValues) {
    if (mode === "edit" && provider?.status === "Active" && values.status === "Inactive" && !pendingPause) {
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
          <DialogTitle>{mode === "add" ? "Add provider" : "Edit provider"}</DialogTitle>
          <DialogDescription>
            {pendingPause
              ? "Pausing this provider keeps the sample record and blocks new task assignments until it is enabled again."
              : "Save a sample provider configuration. No API key is collected, and no provider is contacted."}
          </DialogDescription>
        </DialogHeader>
        {pendingPause ? null : (
          <div className="mt-4 grid gap-4">
            <FormField label="Provider name" htmlFor="provider-name" error={errors.name?.message} required>
              <Input
                id="provider-name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "provider-name-error" : undefined}
                {...register("name")}
              />
            </FormField>
            <FormField
              label="Provider identifier"
              htmlFor="provider-identifier"
              error={errors.identifier?.message}
              required
              hint="A short sample id such as openai. This is not an API key."
            >
              <Input
                id="provider-identifier"
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={errors.identifier ? "provider-identifier-error" : undefined}
                {...register("identifier")}
              />
            </FormField>
            <FormField label="Description" htmlFor="provider-description" error={errors.description?.message} required>
              <Textarea id="provider-description" rows={3} {...register("description")} />
            </FormField>
            <FormField label="Provider type" htmlFor="provider-type" error={errors.providerType?.message} required>
              <Controller
                name="providerType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="provider-type" className="w-full">
                      <SelectValue placeholder="Select a provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviderTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Default model"
              htmlFor="provider-default-model"
              error={errors.defaultModelId?.message}
              hint={
                models.length === 0
                  ? "Add a sample model for this provider before choosing a default."
                  : "Sample catalog only. The default is used when an administrator sets this provider as the starting choice."
              }
            >
              <Controller
                name="defaultModelId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "unselected"}
                    onValueChange={(value) => field.onChange(value === "unselected" ? "" : value)}
                    disabled={models.length === 0}
                  >
                    <SelectTrigger id="provider-default-model" className="w-full">
                      <SelectValue placeholder="Select a default model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unselected">No default model</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.status === "Inactive" ? `${model.name} (Inactive)` : model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="Status" htmlFor="provider-status" error={errors.status?.message} required>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="provider-status" className="w-full">
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
          onClick={() => {
            if (pendingPause) {
              setPendingPause(false);
              return;
            }
            onCancel();
          }}
          disabled={submitting}
        >
          {pendingPause ? "Back" : "Cancel"}
        </Button>
        <Button type="submit" disabled={submitting}>
          {pendingPause ? "Pause provider" : mode === "add" ? "Add provider" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
