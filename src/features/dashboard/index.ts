import { LayoutDashboard } from "lucide-react";
import type { AdminModule } from "@/types/navigation";

export const dashboardModule = {
  title: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
  description: "Administrative overview of the platform.",
  summary:
    "Review organizations, teams, and access from one workspace. The figures on this page are a layout preview.",
} satisfies AdminModule;
