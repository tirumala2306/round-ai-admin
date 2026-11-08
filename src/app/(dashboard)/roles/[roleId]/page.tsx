import { Suspense } from "react";
import type { Metadata } from "next";
import { RoleDetail } from "@/components/roles/role-detail";
import { sampleRoles } from "@/features/roles/sample-roles";

const knownRoles = sampleRoles;

export function generateStaticParams() {
  return knownRoles.map((role) => ({
    roleId: role.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roleId: string }>;
}): Promise<Metadata> {
  const { roleId } = await params;
  const role = knownRoles.find((item) => item.id === roleId);

  return {
    title: role?.name ?? "Role",
  };
}

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  return (
    <Suspense fallback={<RoleFallback />}>
      <RoleContent params={params} />
    </Suspense>
  );
}

async function RoleContent({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  return <RoleDetail roleId={roleId} />;
}

function RoleFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading role</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
