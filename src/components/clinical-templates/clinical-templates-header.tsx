import { clinicalTemplatesModule } from "@/features/clinical-templates";

export function ClinicalTemplatesHeader() {
  return (
    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
      {clinicalTemplatesModule.summary}
    </p>
  );
}
