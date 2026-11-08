import type { Metadata } from "next";
import { AiConfigurationScreen } from "@/components/ai-configuration/ai-configuration-screen";
import { aiConfigurationModule } from "@/features/ai-configuration";

export const metadata: Metadata = {
  title: aiConfigurationModule.title,
};

export default function AiConfigurationPage() {
  return <AiConfigurationScreen />;
}
