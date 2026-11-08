import { UserRound } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const usersModule = {
  title: "Users",
  href: "/users",
  icon: UserRound,
  description: "Physicians, residents, and clinical staff.",
  summary:
    "Manage physicians, residents, and clinical staff across organizations.",
  emptyTitle: "No users yet",
  emptyDescription:
    "User records in this demo stay in the browser and are not saved to the RoundsAI backend.",
} satisfies FoundationModule;
