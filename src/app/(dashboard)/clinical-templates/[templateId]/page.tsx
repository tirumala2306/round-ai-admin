import { Suspense } from "react";
import type { Metadata } from "next";
import { ClinicalTemplateDetail } from "@/components/clinical-templates/clinical-template-detail";
import { sampleClinicalTemplates } from "@/features/clinical-templates/sample-data";

const knownTemplates = sampleClinicalTemplates;

export function generateStaticParams() {
  return knownTemplates.map((template) => ({
    templateId: template.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ templateId: string }>;
}): Promise<Metadata> {
  const { templateId } = await params;
  const template = knownTemplates.find((item) => item.id === templateId);

  return {
    title: template?.name ?? "Clinical template",
  };
}

export default function ClinicalTemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  return (
    <Suspense fallback={<ClinicalTemplateDetailFallback />}>
      <ClinicalTemplateDetailContent params={params} />
    </Suspense>
  );
}

async function ClinicalTemplateDetailContent({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  return <ClinicalTemplateDetail templateId={templateId} />;
}

function ClinicalTemplateDetailFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading clinical template</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
