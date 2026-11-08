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
import { createAiTaskSchema } from "@/features/ai-configuration/schema";
import {
  providerById,
  selectableFallbackModels,
  selectableModels,
  taskCapability,
  toTaskFormValues,
} from "@/features/ai-configuration/selectors";
import {
  aiConfigStatuses,
  type AiConfiguration,
  type AiTaskConfig,
  type AiTaskFormValues,
} from "@/features/ai-configuration/types";
import {
  claimOrganizationWrite,
  releaseOrganizationWrite,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function TaskFormDialog({
  task,
  config,
  onOpenChange,
  onSubmit,
}: {
  task?: AiTaskConfig;
  config: AiConfiguration;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AiTaskFormValues) => boolean;
}) {
  return (
    <Dialog
      open={Boolean(task)}
      onOpenChange={(next) => {
        if (!next) {
          releaseOrganizationWrite();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[min(44rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {task ? (
          <TaskForm
            key={task.id}
            task={task}
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

function TaskForm({
  task,
  config,
  onCancel,
  onSubmit,
}: {
  task: AiTaskConfig;
  config: AiConfiguration;
  onCancel: () => void;
  onSubmit: (values: AiTaskFormValues) => boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [pendingPause, setPendingPause] = useState(false);
  const [providerId, setProviderId] = useState(task.providerId);
  const [modelId, setModelId] = useState(task.modelId);
  const schema = createAiTaskSchema(config, task.id);
  const providers = [...config.providers].sort((left, right) => left.name.localeCompare(right.name));
  const models = selectableModels(config, task.id, providerId);
  const fallbacks = selectableFallbackModels(config, task.id, modelId);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AiTaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toTaskFormValues(task),
    mode: "onTouched",
  });

  function submit(values: AiTaskFormValues) {
    if (task.status === "Active" && values.status === "Inactive" && !pendingPause) {
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
          <DialogTitle>Configure {task.name}</DialogTitle>
          <DialogDescription>
            {pendingPause
              ? "Disabling this task keeps the sample assignment and stops it from counting as an enabled workflow."
              : `This task requires ${taskCapability[task.id]}. Paused providers and models are omitted. Saving does not run the task.`}
          </DialogDescription>
        </DialogHeader>
        {pendingPause ? null : (
          <div className="mt-4 grid gap-4">
            <FormField label="Task name" htmlFor="task-name">
              <Input id="task-name" value={task.name} readOnly />
            </FormField>
            <FormField label="Description" htmlFor="task-description" error={errors.description?.message} required>
              <Textarea id="task-description" rows={3} {...register("description")} />
            </FormField>
            <FormField label="Assigned provider" htmlFor="task-provider" error={errors.providerId?.message} required>
              <Controller
                name="providerId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "unselected"}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setProviderId(value);
                      setModelId("");
                      setValue("modelId", "", { shouldValidate: false });
                      setValue("fallbackModelId", "", { shouldValidate: false });
                    }}
                  >
                    <SelectTrigger id="task-provider" className="w-full">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id} disabled={provider.status !== "Active"}>
                          {provider.status === "Inactive" ? `${provider.name} (Paused)` : provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Assigned model"
              htmlFor="task-model"
              error={errors.modelId?.message}
              required
              hint={
                providerById(config, providerId)?.status === "Active"
                  ? "Only active models with the required capability are listed."
                  : "Enable the provider before choosing one of its models."
              }
            >
              <Controller
                name="modelId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={models.some((model) => model.id === field.value) ? field.value : "unselected"}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setModelId(value);
                      if (getValues("fallbackModelId") === value) {
                        setValue("fallbackModelId", "", { shouldValidate: false });
                      }
                    }}
                  >
                    <SelectTrigger id="task-model" className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Fallback model"
              htmlFor="task-fallback"
              error={errors.fallbackModelId?.message}
              hint="Optional. The fallback must belong to an enabled provider and support this task."
            >
              <Controller
                name="fallbackModelId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={
                      fallbacks.some((model) => model.id === field.value) ? field.value : "none"
                    }
                    onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                  >
                    <SelectTrigger id="task-fallback" className="w-full">
                      <SelectValue placeholder="No fallback" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No fallback</SelectItem>
                      {fallbacks.map((model) => {
                        const provider = providerById(config, model.providerId);
                        return (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
                            {provider ? ` · ${provider.name}` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              label="Maximum output tokens"
              htmlFor="task-tokens"
              error={errors.maxOutputTokens?.message}
              required
              hint={`The sample request limit is ${config.usageLimits.maxTokensPerRequest.toLocaleString("en-US")} tokens.`}
            >
              <Input
                id="task-tokens"
                type="number"
                min={1}
                step={1}
                {...register("maxOutputTokens", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Status" htmlFor="task-status" error={errors.status?.message} required>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="task-status" className="w-full">
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
          {pendingPause ? "Disable task" : "Save task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
