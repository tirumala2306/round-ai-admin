import type { Metadata } from "next";
import { OrganizationsScreen } from "@/components/organizations/organizations-screen";
import { organizationsModule } from "@/features/organizations";

export const metadata: Metadata = {
  title: organizationsModule.title,
};

export default function OrganizationsPage() {
  return <OrganizationsScreen />;
}
