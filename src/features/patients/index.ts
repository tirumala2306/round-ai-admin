import { ClipboardList } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const patientsModule = {
  title: "Patients",
  href: "/patients",
  icon: ClipboardList,
  description: "Authorized patient administration.",
  summary:
    "Authorized staff will manage patient administration here. This foundation does not show or store patient records.",
  emptyTitle: "No patient records",
  emptyDescription:
    "Patient administration will appear here for authorized roles after the backend is connected. No clinical records are loaded.",
} satisfies FoundationModule;
