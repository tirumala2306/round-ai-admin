import type { Metadata } from "next";
import { TeamsScreen } from "@/components/teams/teams-screen";
import { teamsModule } from "@/features/teams";

export const metadata: Metadata = {
  title: teamsModule.title,
};

export default function ClinicalTeamsPage() {
  return <TeamsScreen />;
}
