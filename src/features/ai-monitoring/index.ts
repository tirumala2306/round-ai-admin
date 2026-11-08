import { BrainCircuit } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const aiMonitoringModule = {
  title: "AI Monitoring",
  href: "/ai-monitoring",
  icon: BrainCircuit,
  description: "Sample view of AI activity, reliability, and estimated cost.",
  summary:
    "Monitor AI activity, model performance, reliability and estimated usage costs across RoundsAI.",
  emptyTitle: "No monitoring data",
  emptyDescription:
    "This demo keeps a synthetic monitoring snapshot in the browser. It is not connected to an AI provider.",
} satisfies FoundationModule;

export type { MonitoringView } from "@/features/ai-monitoring/types";
