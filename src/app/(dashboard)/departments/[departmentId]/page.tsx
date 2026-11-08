import { Suspense } from "react";
import type { Metadata } from "next";
import { DepartmentDetail } from "@/components/departments/department-detail";
import { sampleDirectory } from "@/features/organizations/sample-data";

const knownDepartments = sampleDirectory.departments;

export function generateStaticParams() {
  return knownDepartments.map((department) => ({
    departmentId: department.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}): Promise<Metadata> {
  const { departmentId } = await params;
  const department = knownDepartments.find((item) => item.id === departmentId);

  return {
    title: department?.name ?? "Department",
  };
}

export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  return (
    <Suspense fallback={<DepartmentDetailFallback />}>
      <DepartmentDetailContent params={params} />
    </Suspense>
  );
}

async function DepartmentDetailContent({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  return <DepartmentDetail departmentId={departmentId} />;
}

function DepartmentDetailFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading department</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
