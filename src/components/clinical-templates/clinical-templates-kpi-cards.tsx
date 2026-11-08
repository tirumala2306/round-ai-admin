import {
  isOrganizationWideTemplate,
  summarizeClinicalTemplates,
} from "@/features/clinical-templates/selectors";
import type { ClinicalTemplateListItem } from "@/features/clinical-templates/types";

export function ClinicalTemplatesKpiCards({
  templates,
}: {
  templates: ClinicalTemplateListItem[];
}) {
  const summary = summarizeClinicalTemplates(templates);
  const organizationWide = templates.filter((template) =>
    isOrganizationWideTemplate(template),
  ).length;

  return (
    <section
      aria-label="Sample clinical template counts"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <CountCard label="Total Templates" value={summary.total} />
      <CountCard label="Active Templates" value={summary.active} />
      <CountCard label="Inactive Templates" value={summary.inactive} />
      <CountCard label="Organization-wide Templates" value={organizationWide} />
    </section>
  );
}

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Sample total</p>
    </article>
  );
}
