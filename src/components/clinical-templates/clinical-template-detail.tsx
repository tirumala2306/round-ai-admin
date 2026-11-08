"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateFormDialog } from "@/components/clinical-templates/template-form-dialog";
import { OrganizationStatusBadge } from "@/components/organizations/status-badge";
import { Button } from "@/components/ui/button";
import { toClinicalTemplateListItem } from "@/features/clinical-templates/selectors";
import type { ClinicalTemplateFormValues } from "@/features/clinical-templates/types";
import {
  releaseOrganizationWrite,
  updateClinicalTemplate,
  useIsClient,
  useOrganizationDirectory,
} from "@/features/organizations/demo-store";
import { formatCreatedDate } from "@/features/organizations/format";
import { showOrganizationToast } from "@/features/organizations/toast-store";

export function ClinicalTemplateDetail({ templateId }: { templateId: string }) {
  const isClient = useIsClient();
  const directory = useOrganizationDirectory();
  const template = directory.clinicalTemplates.find((item) => item.id === templateId);
  const [editing, setEditing] = useState(false);

  if (!isClient) {
    return <ClinicalTemplateDetailSkeleton />;
  }

  if (!template) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-base font-semibold tracking-tight">
          Template not in this sample
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This address does not match a clinical template in the current sample list.
          Refreshing the page restores the original records.
        </p>
        <Button asChild className="mt-6">
          <Link href="/clinical-templates">Back to clinical templates</Link>
        </Button>
      </section>
    );
  }

  function saveTemplate(values: ClinicalTemplateFormValues) {
    const saved = updateClinicalTemplate(templateId, values);
    releaseOrganizationWrite();
    if (!saved) {
      showOrganizationToast("This organization already has a template with this name.");
      return false;
    }
    showOrganizationToast(`${values.name} was updated in this sample list.`);
    setEditing(false);
    return true;
  }

  const item = toClinicalTemplateListItem(template, directory);
  const sections = [...item.sections].sort((left, right) => left.sortOrder - right.sortOrder);
  const organization = directory.organizations.find((entry) => entry.id === item.organizationId);
  const department =
    item.departmentId === null
      ? undefined
      : directory.departments.find((entry) => entry.id === item.departmentId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/clinical-templates"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Clinical Templates
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{item.name}</h2>
            <OrganizationStatusBadge status={item.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.organizationName}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={() => {
            releaseOrganizationWrite();
            setEditing(true);
          }}
        >
          Edit template
        </Button>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Template overview</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <DetailItem label="Template" value={item.name} />
            <DetailItem label="Template ID" value={item.id} />
            <div>
              <dt className="text-xs text-muted-foreground">Organization</dt>
              <dd className="mt-1">
                {organization ? (
                  <Link
                    href={`/organizations/${organization.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {organization.name}
                  </Link>
                ) : (
                  item.organizationName
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Department / Scope</dt>
              <dd className="mt-1">
                {item.departmentId === null ? (
                  "Organization-wide"
                ) : department ? (
                  <Link
                    href={`/departments/${department.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {department.name}
                  </Link>
                ) : (
                  item.departmentName
                )}
              </dd>
            </div>
            <DetailItem label="Workflow" value={item.workflow} />
            <DetailItem label="Sections" value={String(item.sections.length)} />
            <DetailItem label="Status" value={item.status} />
            <DetailItem label="Updated" value={formatCreatedDate(item.updatedAt)} />
            <div className="sm:col-span-2">
              <DetailItem label="Description" value={item.description || "Not provided"} />
            </div>
          </dl>
        </article>
        <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold">Sections</h3>
          {sections.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">This template has no sections.</p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3">
              {sections.map((section) => (
                <li key={section.id} className="rounded-lg border border-border px-3 py-2.5">
                  <p className="text-sm font-medium text-foreground">
                    {section.sortOrder}. {section.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.guidance}</p>
                </li>
              ))}
            </ol>
          )}
        </article>
      </section>
      <TemplateFormDialog
        open={editing}
        mode="edit"
        template={template}
        directory={directory}
        onOpenChange={setEditing}
        onSubmit={saveTemplate}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}

function ClinicalTemplateDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only">Loading clinical template</span>
      <div className="h-16 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg border border-border bg-card" />
    </div>
  );
}
