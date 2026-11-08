import type { Metadata } from "next";
import { ClinicalTemplatesScreen } from "@/components/clinical-templates/clinical-templates-screen";
import { clinicalTemplatesModule } from "@/features/clinical-templates";

export const metadata: Metadata = {
  title: clinicalTemplatesModule.title,
};

export default function ClinicalTemplatesPage() {
  return <ClinicalTemplatesScreen />;
}
