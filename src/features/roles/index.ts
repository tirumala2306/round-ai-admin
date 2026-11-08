import { ShieldCheck } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const rolesModule = {
  title: "Roles & Permissions",
  href: "/roles",
  icon: ShieldCheck,
  description: "Access levels for administrators and clinical staff.",
  summary: "Manage access levels and permissions across RoundsAI.",
  emptyTitle: "No roles yet",
  emptyDescription:
    "Role records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;
