"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { AiConfigConfirmDialog } from "@/components/ai-configuration/confirm-dialog";
import { ProviderDetailDialog } from "@/components/ai-configuration/provider-detail-dialog";
import { ProviderFormDialog } from "@/components/ai-configuration/provider-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  aiConnectionLabel,
  assignedTaskCount,
} from "@/features/ai-configuration/selectors";
import type { AiConfiguration, AiProvider, AiProviderFormValues } from "@/features/ai-configuration/types";
import {
  addAiProvider,
  claimOrganizationWrite,
  releaseOrganizationWrite,
  setAiProviderStatus,
  updateAiProvider,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function ProvidersPanel({ config }: { config: AiConfiguration }) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AiProvider | undefined>();
  const [viewingId, setViewingId] = useState<string | undefined>();
  const [pausing, setPausing] = useState<AiProvider | undefined>();
  const viewing = config.providers.find((provider) => provider.id === viewingId);
  const providers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...config.providers]
      .filter((provider) => {
        if (!term) {
          return true;
        }
        return (
          provider.name.toLowerCase().includes(term) ||
          provider.identifier.includes(term) ||
          provider.description.toLowerCase().includes(term)
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [config.providers, query]);

  function saveProvider(values: AiProviderFormValues) {
    const result = editing ? updateAiProvider(editing.id, values) : addAiProvider(values);
    releaseOrganizationWrite();
    if (!result.ok) {
      showOrganizationToast(result.message);
      return false;
    }
    showOrganizationToast(
      editing
        ? `${values.name} was updated in this sample configuration.`
        : `${values.name} was added to this sample configuration.`,
    );
    setAdding(false);
    setEditing(undefined);
    return true;
  }

  function changeStatus(provider: AiProvider) {
    if (!claimOrganizationWrite()) {
      showOrganizationToast("Another sample change is still open.");
      return;
    }
    const nextStatus = provider.status === "Active" ? "Inactive" : "Active";
    const result = setAiProviderStatus(provider.id, nextStatus);
    releaseOrganizationWrite();
    if (!result.ok) {
      showOrganizationToast(result.message);
      return;
    }
    showOrganizationToast(
      nextStatus === "Active"
        ? `${provider.name} is active in this sample configuration.`
        : `${provider.name} is paused in this sample configuration.`,
    );
    setPausing(undefined);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="grid gap-1.5 text-sm">
          <span className="sr-only">Search providers</span>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search providers"
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
          Add provider
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[920px] text-sm">
          <caption className="sr-only">
            Sample AI providers. Connection status is demo configuration status, not a live provider connection.
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="px-4 py-2.5">Provider</th>
              <th scope="col" className="px-4 py-2.5">Type</th>
              <th scope="col" className="px-4 py-2.5">Connection</th>
              <th scope="col" className="px-4 py-2.5 text-right">Assigned tasks</th>
              <th scope="col" className="px-4 py-2.5">Status</th>
              <th scope="col" className="px-4 py-2.5">Updated</th>
              <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No providers match this search.
                </td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr key={provider.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.identifier}</p>
                  </td>
                  <td className="px-4 py-3">{provider.providerType}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-normal">
                      {aiConnectionLabel(provider.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {assignedTaskCount(config, provider.id)}
                  </td>
                  <td className="px-4 py-3">
                    <OrganizationStatusBadge status={provider.status} />
                  </td>
                  <td className="px-4 py-3">{formatCreatedDate(provider.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-nowrap items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`View ${provider.name}`}
                        onClick={() => setViewingId(provider.id)}
                      >
                        <Eye />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${provider.name}`}
                        onClick={() => {
                          releaseOrganizationWrite();
                          setAdding(false);
                          setEditing(provider);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-24"
                        onClick={() => {
                          if (provider.status === "Active") {
                            setPausing(provider);
                            return;
                          }
                          changeStatus(provider);
                        }}
                      >
                        {provider.status === "Active" ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ProviderFormDialog
        open={adding || Boolean(editing)}
        mode={editing ? "edit" : "add"}
        provider={editing}
        config={config}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditing(undefined);
          }
        }}
        onSubmit={saveProvider}
      />
      <ProviderDetailDialog
        provider={viewing}
        config={config}
        onOpenChange={(open) => {
          if (!open) {
            setViewingId(undefined);
          }
        }}
        onEdit={(provider) => {
          releaseOrganizationWrite();
          setEditing(provider);
        }}
      />
      <AiConfigConfirmDialog
        open={Boolean(pausing)}
        title={`Disable ${pausing?.name ?? "provider"}?`}
        description="The sample provider stays in the list as inactive. Active tasks that still use it must be reassigned first. This does not disconnect a live account."
        confirmLabel="Disable provider"
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
