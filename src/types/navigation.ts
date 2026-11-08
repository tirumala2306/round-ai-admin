import type { LucideIcon } from "lucide-react";

export type AppRoute =
  | "/dashboard"
  | "/organizations"
  | "/departments"
  | "/clinical-teams"
  | "/users"
  | "/roles"
  | "/patients"
  | "/clinical-templates"
  | "/knowledge-base"
  | "/ai-monitoring"
  | "/ai-interactions"
  | "/ai-configuration"
  | "/audit-logs"
  | "/system-settings";

export type AdminModule = {
  title: string;
  href: AppRoute;
  icon: LucideIcon;
  description: string;
  summary: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export type FoundationModule = AdminModule & {
  emptyTitle: string;
  emptyDescription: string;
};
