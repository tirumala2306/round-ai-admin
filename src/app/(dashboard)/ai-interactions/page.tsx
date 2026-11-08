import type { Metadata } from "next";
import { AiInteractionsScreen } from "@/components/ai-interactions/ai-interactions-screen";
import { aiInteractionsModule } from "@/features/ai-interactions";

export const metadata: Metadata = {
  title: aiInteractionsModule.title,
};

export default function AiInteractionsPage() {
  return <AiInteractionsScreen />;
}
