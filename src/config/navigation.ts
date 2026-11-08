import { aiConfigurationModule } from "@/features/ai-configuration";
import { aiInteractionsModule } from "@/features/ai-interactions";
import { aiMonitoringModule } from "@/features/ai-monitoring";
import { auditLogsModule } from "@/features/audit-logs";
import { clinicalTemplatesModule } from "@/features/clinical-templates";
import { dashboardModule } from "@/features/dashboard";
import { departmentsModule } from "@/features/departments";
import { knowledgeBaseModule } from "@/features/knowledge-base";
import { organizationsModule } from "@/features/organizations";
import { patientsModule } from "@/features/patients";
import { rolesModule } from "@/features/roles";
import { systemSettingsModule } from "@/features/system-settings";
import { teamsModule } from "@/features/teams";
import { usersModule } from "@/features/users";
import type { AdminModule } from "@/types/navigation";

export type NavGroup = {
  label: string;
  items: AdminModule[];
};

export const mainNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [dashboardModule],
  },
  {
    label: "Organization",
    items: [organizationsModule, departmentsModule, teamsModule],
  },
  {
    label: "Access",
    items: [usersModule, rolesModule],
  },
  {
    label: "Clinical",
    items: [patientsModule, clinicalTemplatesModule, knowledgeBaseModule],
  },
  {
    label: "Oversight",
    items: [aiMonitoringModule, aiInteractionsModule, aiConfigurationModule, auditLogsModule],
  },
];

export const utilityNavigation: AdminModule[] = [systemSettingsModule];

export const adminModules: AdminModule[] = [
  ...mainNavigation.flatMap((group) => group.items),
  ...utilityNavigation,
];

export function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getActiveModule(pathname: string): AdminModule {
  return (
    adminModules.find((item) => item.href === pathname) ??
    adminModules.find((item) => isNavItemActive(pathname, item.href)) ??
    dashboardModule
  );
}
