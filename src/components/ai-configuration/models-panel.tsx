"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { AiConfigConfirmDialog } from "@/components/ai-configuration/confirm-dialog";
import { ModelFormDialog } from "@/components/ai-configuration/model-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { providerById, tasksUsingModel } from "@/features/ai-configuration/selectors";
import type { AiConfiguration, AiModel, AiModelFormValues } from "@/features/ai-configuration/types";
import {
  addAiModel,
  claimOrganizationWrite,
  releaseOrganizationWrite,
  setAiModelStatus,
  setProviderDefaultModel,
  updateAiModel,
} from "@/features/organizations/demo-store";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function ModelsPanel({
  config,
  onConfigureTasks,
}: {
  config: AiConfiguration;
  onConfigureTasks: () => void;
}) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AiModel | undefined>();
  const [pausing, setPausing] = useState<AiModel | undefined>();
  const models = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...config.models]
      .filter((model) => {
        const provider = providerById(config, model.providerId);
        if (!term) {
          return true;
        }
        return (
          model.name.toLowerCase().includes(term) ||
          model.description.toLowerCase().includes(term) ||
          provider?.name.toLowerCase().includes(term) === true
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [config, query]);

  function saveModel(values: AiModelFormValues) {
    const result = editing
      ? updateAiModel(editing.id, { ...values, providerId: editing.providerId })
      : addAiModel(values);
    releaseOrganizationWrite();
    if (!result.ok) {
      showOrganizationToast(result.message);
      return false;
    }
    showOrganizationToast(
      editing
        ? `${values.name} was updated in this sample catalog.`
        : `${values.name} was added to this sample catalog.`,
    );
    setAdding(false);
    setEditing(undefined);
    return true;
  }

  function runLocked(action: () => void) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      return;
    }
    action();
    releaseOrganizationWrite();
  }

  function changeStatus(model: AiModel) {
    const nextStatus = model.status === "Active" ? "Inactive" : "Active";
    runLocked(() => {
      const result = setAiModelStatus(model.id, nextStatus);
      if (!result.ok) {
        showOrganizationToast(result.message);
        return;
      }
      showOrganizationToast(
        nextStatus === "Active"
          ? `${model.name} is active in this sample catalog.`
          : `${model.name} is paused in this sample catalog.`,
      );
      setPausing(undefined);
    });
  }

  function makeDefault(model: AiModel) {
    runLocked(() => {
      const result = setProviderDefaultModel(model.providerId, model.id);
      if (!result.ok) {
        showOrganizationToast(result.message);
        return;
      }
      showOrganizationToast(`${model.name} is the default model in this sample configuration.`);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="grid gap-1.5 text-sm">
          <span className="sr-only">Search models</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models"
            className="sm:w-64"
          />
        </label>
        <Button
          type="button"
          onClick={() => {
            releaseOrganizationWrite();
            setEditing(undefined);
            setAdding(true);
          }}
        >
          Add sample model
        </Button>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        Assign a model to a workflow from the Tasks tab. A model on a paused provider cannot be selected there.
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[980px] text-sm">
          <caption className="sr-only">Sample model catalog for AI configuration.</caption>
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="px-4 py-2.5">Model</th>
              <th scope="col" className="px-4 py-2.5">Provider</th>
              <th scope="col" className="px-4 py-2.5">Capabilities</th>
              <th scope="col" className="px-4 py-2.5 text-right">Assigned tasks</th>
              <th scope="col" className="px-4 py-2.5">Status</th>
              <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No models match this search.
                </td>
              </tr>
            ) : (
              models.map((model) => {
                const provider = providerById(config, model.providerId);
                const isDefault = provider?.defaultModelId === model.id;
                const providerPaused = provider?.status !== "Active";
                return (
                  <tr key={model.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{model.name}</p>
                      <p className="max-w-xs text-xs leading-5 text-muted-foreground">{model.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      {provider?.name ?? "Unknown provider"}
                      {providerPaused ? (
                        <span className="block text-xs text-muted-foreground">Provider paused</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs leading-5">{model.capabilities.join(", ")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {tasksUsingModel(config, model.id).length}
                    </td>
                    <td className="px-4 py-3">
                      <OrganizationStatusBadge status={model.status} />
                      {isDefault ? (
                        <span className="mt-1 block text-xs text-muted-foreground">Default</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-nowrap items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${model.name}`}
                          onClick={() => {
                            releaseOrganizationWrite();
                            setAdding(false);
                            setEditing(model);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={onConfigureTasks}>
                          Assign
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isDefault || model.status !== "Active" || providerPaused}
                          onClick={() => makeDefault(model)}
                        >
                          Set default
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-24"
                          onClick={() => {
                            if (model.status === "Active") {
                              setPausing(model);
                              return;
                            }
                            changeStatus(model);
                          }}
                        >
                          {model.status === "Active" ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <ModelFormDialog
        open={adding || Boolean(editing)}
        mode={editing ? "edit" : "add"}
        model={editing}
        config={config}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditing(undefined);
          }
        }}
        onSubmit={saveModel}
      />
      <AiConfigConfirmDialog
        open={Boolean(pausing)}
        title={`Disable ${pausing?.name ?? "model"}?`}
        description="The sample model stays in the catalog as inactive. Active tasks and an active provider default must be moved first."
        confirmLabel="Disable model"
        onOpenChange={(open) => {
          if (!open) {
            setPausing(undefined);
          }
        }}
        onConfirm={() => {
          if (pausing) {
            changeStatus(pausing);
          }
        }}
      />
    </div>
  );
}
