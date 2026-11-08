"use client";

import { useState } from "react";
import { TaskFormDialog } from "@/components/ai-configuration/task-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { modelById, providerById, taskCapability } from "@/features/ai-configuration/selectors";
import type { AiConfiguration, AiTaskConfig, AiTaskFormValues } from "@/features/ai-configuration/types";
import { releaseOrganizationWrite, updateAiTask } from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function TasksPanel({ config }: { config: AiConfiguration }) {
  const [editing, setEditing] = useState<AiTaskConfig | undefined>();
  const current = config.tasks.find((task) => task.id === editing?.id);

  function saveTask(values: AiTaskFormValues) {
    if (!current) {
      releaseOrganizationWrite();
      return false;
    }
    const result = updateAiTask(current.id, values);
    releaseOrganizationWrite();
    if (!result.ok) {
      showOrganizationToast(result.message);
      return false;
    }
    showOrganizationToast(`${current.name} was updated in this sample configuration.`);
    setEditing(undefined);
    return true;
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm leading-6 text-muted-foreground">
        Each workflow keeps its name. Choose an enabled provider and model, and an optional fallback from an enabled provider.
      </p>
      <ul className="grid gap-3">
        {config.tasks.map((task) => {
          const provider = providerById(config, task.providerId);
          const model = modelById(config, task.modelId);
          const fallback = modelById(config, task.fallbackModelId);
          return (
            <li key={task.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium">{task.name}</h3>
                    <OrganizationStatusBadge status={task.status} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{task.description}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => {
                    releaseOrganizationWrite();
                    setEditing(task);
                  }}
                >
                  Configure
                </Button>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Provider</dt>
                  <dd className="mt-1">{provider?.name ?? "Unknown provider"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Model</dt>
                  <dd className="mt-1">{model?.name ?? "Unknown model"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Fallback</dt>
                  <dd className="mt-1">{fallback?.name ?? "None"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Output token limit</dt>
                  <dd className="mt-1 tabular-nums">{task.maxOutputTokens.toLocaleString("en-US")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Required capability</dt>
                  <dd className="mt-1">{taskCapability[task.id]}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Updated</dt>
                  <dd className="mt-1">{formatCreatedDate(task.updatedAt)}</dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ul>
      <TaskFormDialog
        task={current}
        config={config}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(undefined);
          }
        }}
        onSubmit={saveTask}
      />
    </div>
  );
}
