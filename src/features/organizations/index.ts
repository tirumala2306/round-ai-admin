import { Building2 } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const organizationsModule = {
  title: "Organizations",
  href: "/organizations",
  icon: Building2,
  description: "Hospitals registered on the platform.",
  summary:
    "Manage hospitals and healthcare organizations registered on RoundsAI.",
  emptyTitle: "No organizations yet",
  emptyDescription:
    "Organization records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;
