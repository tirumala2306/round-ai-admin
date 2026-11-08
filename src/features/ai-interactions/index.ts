import { MessagesSquare } from "lucide-react";
import type { FoundationModule } from "@/types/navigation";

export const aiInteractionsModule = {
  title: "AI Questions & Interactions",
  href: "/ai-interactions",
  icon: MessagesSquare,
  description: "Sample review of AI questions, responses, and feedback.",
  summary:
    "Monitor AI conversations, review generated responses, and track interaction quality across RoundsAI.",
  emptyTitle: "No interactions in this view",
  emptyDescription:
    "This demo keeps synthetic questions and responses in the browser session. It is not connected to an AI provider.",
} satisfies FoundationModule;
