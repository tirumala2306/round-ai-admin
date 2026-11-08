"use client";

import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  aiConnectionLabel,
  assignedTaskCount,
  modelById,
  modelsForProvider,
  taskUsesProvider,
} from "@/features/ai-configuration/selectors";
import type { AiConfiguration, AiProvider } from "@/features/ai-configuration/types";
import { formatCreatedDate } from "@/features/organizations/format";

export function ProviderDetailDialog({
  provider,
  config,
  onOpenChange,
  onEdit,
}: {
  provider?: AiProvider;
  config: AiConfiguration;
  onOpenChange: (open: boolean) => void;
  onEdit: (provider: AiProvider) => void;
}) {
  const models = provider ? modelsForProvider(config, provider.id) : [];
  const tasks = provider
    ? config.tasks.filter((task) => taskUsesProvider(config, task, provider.id))
    : [];
  const defaultModel = provider ? modelById(config, provider.defaultModelId) : undefined;

  return (
    <Dialog open={Boolean(provider)} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(40rem,calc(100svh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        {provider ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <DialogHeader className="pr-8">
                <DialogTitle>{provider.name}</DialogTitle>
                <DialogDescription>
                  Sample provider details. Connection status describes this configuration only.
                  RoundsAI has not contacted {provider.name}.
                </DialogDescription>
              </DialogHeader>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem label="Identifier" value={provider.identifier} />
                <DetailItem label="Type" value={provider.providerType} />
                <div>
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <OrganizationStatusBadge status={provider.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Connection</dt>
                  <dd className="mt-1">
                    <Badge variant="outline" className="font-normal">
                      {aiConnectionLabel(provider.status)}
                    </Badge>
                  </dd>
                </div>
                <DetailItem label="Default model" value={defaultModel?.name ?? "None"} />
                <DetailItem label="Assigned tasks" value={String(assignedTaskCount(config, provider.id))} />
                <DetailItem label="Updated" value={formatCreatedDate(provider.updatedAt)} />
                <DetailItem label="Created" value={formatCreatedDate(provider.createdAt)} />
              </dl>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{provider.description}</p>
              <section className="mt-4">
                <h3 className="text-sm font-medium">Sample models</h3>
                {models.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No sample models for this provider yet.</p>
                ) : (
                  <ul className="mt-2 grid gap-2">
                    {models.map((model) => (
                      <li key={model.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-muted-foreground"> · {model.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="mt-4">
                <h3 className="text-sm font-medium">Task assignments</h3>
                {tasks.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No tasks use this provider.</p>
                ) : (
                  <ul className="mt-2 grid gap-2">
                    {tasks.map((task) => (
                      <li key={task.id} className="text-sm">
                        {task.name}
                        <span className="text-muted-foreground">
                          {task.providerId === provider.id ? " · Assigned provider" : " · Fallback"}
                          {task.status === "Inactive" ? " · Inactive" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <DialogFooter className="border-t border-border px-4 py-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(provider);
                }}
              >
                Edit provider
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
