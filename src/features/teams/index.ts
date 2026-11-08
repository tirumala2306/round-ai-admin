import { Users } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const teamsModule = {
  title: "Clinical Teams",
  href: "/clinical-teams",
  icon: Users,
  description: "Clinical teams and their members.",
  summary:
    "Manage clinical teams and their members across hospital departments.",
  emptyTitle: "No clinical teams yet",
  emptyDescription:
    "Team records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;
