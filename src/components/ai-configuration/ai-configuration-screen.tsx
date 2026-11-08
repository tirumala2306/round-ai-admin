"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission, isAdminRole, resolveAuthContext } from "@/features/auth/auth-service";
import { useAuthSession } from "@/features/auth/session";
import { ModelsPanel } from "@/components/ai-configuration/models-panel";
import { ProvidersPanel } from "@/components/ai-configuration/providers-panel";
import { SafetyPanel } from "@/components/ai-configuration/safety-panel";
import { TasksPanel } from "@/components/ai-configuration/tasks-panel";
import { UsagePanel } from "@/components/ai-configuration/usage-panel";
import {
  aiConfigurationModule,
  aiConfigurationPermissionId,
  summarizeAiConfiguration,
} from "@/features/ai-configuration";
import { useIsClient, useOrganizationDirectory } from "@/features/organizations/demo-store";

export function AiConfigurationScreen() {
  const directory = useOrganizationDirectory();
  const isClient = useIsClient();
  const userId = useAuthSession();
  const [tab, setTab] = useState("providers");
  const context = userId ? resolveAuthContext(directory, userId) : undefined;
  const allowed = Boolean(
    context && isAdminRole(context.roleName) && hasPermission(context, aiConfigurationPermissionId),
  );

  if (!isClient) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <span className="sr-only">Loading AI configuration</span>
        <div className="h-16 rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <section className="max-w-xl rounded-lg border border-border bg-card px-4 py-6">
        <h2 className="text-base font-semibold tracking-tight">AI configuration is unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Manage AI Configuration is limited to hospital administrators whose role includes that permission.
        </p>
      </section>
    );
  }

  const config = directory.aiConfiguration;
  const summary = summarizeAiConfiguration(config);

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{aiConfigurationModule.summary}</p>
      <section aria-label="Sample AI configuration counts" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CountCard label="Total AI Providers" value={summary.totalProviders} />
        <CountCard label="Active Providers" value={summary.activeProviders} />
        <CountCard label="Configured AI Tasks" value={summary.configuredTasks} />
        <CountCard label="Disabled AI Tasks" value={summary.disabledTasks} />
      </section>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="providers" className="pt-4">
          <ProvidersPanel config={config} />
        </TabsContent>
        <TabsContent value="models" className="pt-4">
          <ModelsPanel config={config} onConfigureTasks={() => setTab("tasks")} />
        </TabsContent>
        <TabsContent value="tasks" className="pt-4">
          <TasksPanel config={config} />
        </TabsContent>
        <TabsContent value="safety" className="pt-4">
          <SafetyPanel key={config.safety.updatedAt} safety={config.safety} />
        </TabsContent>
        <TabsContent value="usage" className="pt-4">
          <UsagePanel key={config.usageLimits.updatedAt} config={config} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value.toLocaleString("en-US")}</p>
      <p className="mt-1 text-xs text-muted-foreground">Sample total</p>
    </article>
  );
}
