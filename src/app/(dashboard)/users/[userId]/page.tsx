import { Suspense } from "react";
import type { Metadata } from "next";
import { UserDetail } from "@/components/users/user-detail";
import { sampleDirectory } from "@/features/organizations/sample-data";

const knownUsers = sampleDirectory.users;

export function generateStaticParams() {
  return knownUsers.map((user) => ({
    userId: user.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = knownUsers.find((item) => item.id === userId);

  return {
    title: user?.name ?? "User",
  };
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  return (
    <Suspense fallback={<UserFallback />}>
      <UserContent params={params} />
    </Suspense>
  );
}

async function UserContent({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserDetail userId={userId} />;
}

function UserFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading user</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
