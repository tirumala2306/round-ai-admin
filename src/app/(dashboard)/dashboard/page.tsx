import type { Metadata } from "next";
import { DashboardScreen } from "@/components/dashboard/dashboard-screen";
import { dashboardModule } from "@/features/dashboard";

export const metadata: Metadata = {
  title: dashboardModule.title,
};

export default function DashboardPage() {
  return <DashboardScreen />;
}
