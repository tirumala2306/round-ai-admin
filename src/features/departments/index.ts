import { Layers } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const departmentsModule = {
  title: "Departments",
  href: "/departments",
  icon: Layers,
  description: "Hospital departments and their clinical teams.",
  summary: "Manage hospital departments and their clinical teams.",
  emptyTitle: "No departments yet",
  emptyDescription:
    "Department records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;
