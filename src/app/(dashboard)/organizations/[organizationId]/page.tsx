import { Suspense } from "react";
import type { Metadata } from "next";
import { OrganizationDetail } from "@/components/organizations/organization-detail";
import { sampleOrganizations } from "@/features/organizations/sample-data";

export function generateStaticParams() {
  return sampleOrganizations.map((organization) => ({
    organizationId: organization.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}): Promise<Metadata> {
  const { organizationId } = await params;
  const organization = sampleOrganizations.find(
    (item) => item.id === organizationId,
  );

  return {
    title: organization?.name ?? "Organization",
  };
}

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  return (
    <Suspense fallback={<OrganizationDetailFallback />}>
      <OrganizationDetailContent params={params} />
    </Suspense>
  );
}

async function OrganizationDetailContent({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <OrganizationDetail organizationId={organizationId} />;
}

function OrganizationDetailFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading organization</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
