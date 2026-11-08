"use client";

import { useState } from "react";
import { AboutPanel } from "@/components/system-settings/about-panel";
import { ClinicalSettingsPanel } from "@/components/system-settings/clinical-panel";
import { GeneralSettingsPanel } from "@/components/system-settings/general-panel";
import { PreferencesPanel } from "@/components/system-settings/preferences-panel";
import { SecuritySettingsPanel } from "@/components/system-settings/security-panel";
import { SessionSettingsPanel } from "@/components/system-settings/session-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasPermission, isAdminRole, resolveAuthContext } from "@/features/auth/auth-service";
import { useAuthSession } from "@/features/auth/session";
import { useIsClient, useOrganizationDirectory } from "@/features/organizations/demo-store";
import {
  systemSettingsEditPermissionId,
  systemSettingsModule,
  systemSettingsViewPermissionId,
} from "@/features/system-settings";

const sections = [
  ["general", "General Settings"],
  ["preferences", "Application Preferences"],
  ["session", "User & Session Settings"],
  ["security", "Security Settings"],
  ["clinical", "Clinical Workflow Settings"],
  ["about", "About & Version"],
] as const;

export function SystemSettingsScreen() {
  const directory = useOrganizationDirectory();
  const isClient = useIsClient();
  const userId = useAuthSession();
  const [section, setSection] = useState<(typeof sections)[number][0]>("general");
  const context = userId ? resolveAuthContext(directory, userId) : undefined;
  const canView = Boolean(
    context && isAdminRole(context.roleName) && hasPermission(context, systemSettingsViewPermissionId),
  );
  const canEdit = Boolean(
    context && canView && hasPermission(context, systemSettingsEditPermissionId),
  );

  if (!isClient) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <span className="sr-only">Loading system settings</span>
        <div className="h-16 rounded-lg border border-border bg-card" />
      </div>
    );
  }

  if (!canView || !context) {
    return (
      <section className="max-w-xl rounded-lg border border-border bg-card px-4 py-6">
        <h2 className="text-base font-semibold tracking-tight">System settings are unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          View Settings is limited to hospital administrators whose role includes that permission.
        </p>
      </section>
    );
  }

  const settings = directory.systemSettings;
  const organizationId = context.user.organizationId;

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{systemSettingsModule.summary}</p>
      {canEdit ? null : (
        <p className="max-w-2xl rounded-lg border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
          You can review these sample preferences. Edit General Settings is required to change them.
        </p>
      )}
      <Tabs
        orientation="vertical"
        value={section}
        onValueChange={(value) => {
          if (sections.some(([id]) => id === value)) {
            setSection(value as (typeof sections)[number][0]);
          }
        }}
        className="flex-col items-stretch gap-4 md:flex-row"
      >
        <TabsList className="h-auto! w-full flex-col items-stretch md:w-60 md:shrink-0">
          {sections.map(([id, label]) => (
            <TabsTrigger key={id} value={id} className="h-auto! w-full justify-start px-3 py-2 whitespace-normal text-left">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="min-w-0 flex-1">
          <TabsContent value="general">
            <GeneralSettingsPanel key={settings.general.updatedAt} general={settings.general} canEdit={canEdit} />
          </TabsContent>
          <TabsContent value="preferences">
            <PreferencesPanel
              key={settings.preferences.updatedAt}
              preferences={settings.preferences}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="session">
            <SessionSettingsPanel key={settings.session.updatedAt} session={settings.session} canEdit={canEdit} />
          </TabsContent>
          <TabsContent value="security">
            <SecuritySettingsPanel key={settings.security.updatedAt} security={settings.security} canEdit={canEdit} />
          </TabsContent>
          <TabsContent value="clinical">
            <ClinicalSettingsPanel
              key={`${settings.clinical.updatedAt}-${directory.clinicalTemplates.map((item) => `${item.id}:${item.status}`).join(",")}`}
              clinical={settings.clinical}
              templates={directory.clinicalTemplates}
              organizationId={organizationId}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="about">
            <AboutPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
