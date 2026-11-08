import { Suspense } from "react";
import type { Metadata } from "next";
import { TeamDetail } from "@/components/teams/team-detail";
import { sampleDirectory } from "@/features/organizations/sample-data";

const knownTeams = sampleDirectory.teams;

export function generateStaticParams() {
  return knownTeams.map((team) => ({
    teamId: team.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamId: string }>;
}): Promise<Metadata> {
  const { teamId } = await params;
  const team = knownTeams.find((item) => item.id === teamId);

  return {
    title: team?.name ?? "Clinical team",
  };
}

export default function ClinicalTeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  return (
    <Suspense fallback={<ClinicalTeamFallback />}>
      <ClinicalTeamContent params={params} />
    </Suspense>
  );
}

async function ClinicalTeamContent({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  return <TeamDetail teamId={teamId} />;
}

function ClinicalTeamFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading clinical team</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
