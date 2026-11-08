import { ClipboardList } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const auditLogsModule = {
  title: "Audit Logs",
  href: "/audit-logs",
  icon: ClipboardList,
  description: "Read-only history of sample administrative activity.",
  summary: "Track and review administrative activities across your organization.",
  emptyTitle: "No audit events in this view",
  emptyDescription:
    "These records are synthetic sample events kept only in this browser session. They are not a production activity history.",
} satisfies FoundationModule;
