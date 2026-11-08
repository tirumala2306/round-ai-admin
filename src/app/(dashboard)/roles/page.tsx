import type { Metadata } from "next";
import { RolesScreen } from "@/components/roles/roles-screen";
import { rolesModule } from "@/features/roles";

export const metadata: Metadata = {
  title: rolesModule.title,
};

export default function RolesPage() {
  return <RolesScreen />;
}
