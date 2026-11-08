import type { Metadata } from "next";
import { AiMonitoringScreen } from "@/components/ai-monitoring/ai-monitoring-screen";
import { aiMonitoringModule } from "@/features/ai-monitoring";

export const metadata: Metadata = {
  title: aiMonitoringModule.title,
};

export default function AiMonitoringPage() {
  return <AiMonitoringScreen />;
}
