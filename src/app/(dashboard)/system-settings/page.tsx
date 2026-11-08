import type { Metadata } from "next";
import { SystemSettingsScreen } from "@/components/system-settings/system-settings-screen";
import { systemSettingsModule } from "@/features/system-settings";

export const metadata: Metadata = {
  title: systemSettingsModule.title,
};

export default function SystemSettingsPage() {
  return <SystemSettingsScreen />;
}
