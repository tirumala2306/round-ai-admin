import type { ClinicalTemplate, ClinicalTemplateSection } from "@/features/clinical-templates/types";

export const CLINICAL_TEMPLATE_SAMPLE_NOTICE =
  "These clinical templates are synthetic sample records kept only in this browser session. They do not contain patient information and are not saved to the RoundsAI backend. Refreshing the page restores the original sample set.";

function sections(
  templateId: string,
  items: { title: string; guidance: string }[],
): ClinicalTemplateSection[] {
  return items.map((item, index) => ({
    id: `${templateId}-s${index + 1}`,
    title: item.title,
    guidance: item.guidance,
    sortOrder: index + 1,
  }));
}

/**
 * Synthetic documentation templates.
 * Organization and department ids match the shared sample directory.
 * This file does not import that directory.
 */
export const sampleClinicalTemplates: ClinicalTemplate[] = [
  {
    id: "tpl-mer-progress",
    organizationId: "meridian",
    departmentId: null,
    name: "General Progress Note",
    description: "Organization-wide sample structure for a daily progress note.",
    workflow: "Progress note",
    status: "Active",
    createdAt: "2024-04-02",
    updatedAt: "2024-04-02",
    sections: sections("tpl-mer-progress", [
      {
        title: "Interval history",
        guidance: "Summarize events since the previous sample note, including response to the current plan.",
      },
      {
        title: "Assessment",
        guidance: "List the active problems for this fictional encounter and the current clinical impression.",
      },
      {
        title: "Plan",
        guidance: "Record the next sample actions by problem. Do not enter a real patient name or record number.",
      },
    ]),
  },
  {
    id: "tpl-mer-icu",
    organizationId: "meridian",
    departmentId: "mer-cardiology",
    name: "ICU Progress Note",
    description: "Department sample for a cardiac intensive care progress note.",
    workflow: "Progress note",
    status: "Active",
    createdAt: "2024-04-08",
    updatedAt: "2024-04-08",
    sections: sections("tpl-mer-icu", [
      {
        title: "Overnight events",
        guidance: "Note major overnight changes, escalations, and responses in this sample ICU course.",
      },
      {
        title: "Systems review",
        guidance: "Review cardiovascular, respiratory, renal, and supporting systems using placeholder findings only.",
      },
      {
        title: "Assessment and plan",
        guidance: "Pair each active problem with the current sample plan and the monitoring to continue.",
      },
    ]),
  },
  {
    id: "tpl-ced-soap",
    organizationId: "cedarline",
    departmentId: null,
    name: "SOAP Clinical Note",
    description: "Organization-wide sample SOAP note for routine clinical documentation.",
    workflow: "Clinical note",
    status: "Active",
    createdAt: "2024-06-18",
    updatedAt: "2024-06-18",
    sections: sections("tpl-ced-soap", [
      {
        title: "Subjective",
        guidance: "Record the reported symptoms and concerns for the fictional encounter.",
      },
      {
        title: "Objective",
        guidance: "Enter examination and result placeholders. Do not include a real identifier.",
      },
      {
        title: "Assessment",
        guidance: "State the working impression for each active problem.",
      },
      {
        title: "Plan",
        guidance: "List the sample next steps, follow-up, and items that still need review.",
      },
    ]),
  },
  {
    id: "tpl-ced-signout",
    organizationId: "cedarline",
    departmentId: "ced-surgery",
    name: "Patient Sign-out",
    description: "Department sample for an acute-care surgery handoff.",
    workflow: "Handoff",
    status: "Active",
    createdAt: "2024-06-20",
    updatedAt: "2024-06-20",
    sections: sections("tpl-ced-signout", [
      {
        title: "Summary",
        guidance: "Give a short synthetic summary of the admission and the current status.",
      },
      {
        title: "Pending items",
        guidance: "List studies, consultations, and tasks that remain open in the sample handoff.",
      },
      {
        title: "Contingency plan",
        guidance: "Describe what the covering team should consider if the sample condition changes.",
      },
    ]),
  },
  {
    id: "tpl-ald-rounds",
    organizationId: "alder",
    departmentId: "ald-oncology",
    name: "Daily Rounds Presentation",
    description: "Department sample for presenting one fictional case on oncology rounds.",
    workflow: "Rounds",
    status: "Active",
    createdAt: "2023-10-12",
    updatedAt: "2023-10-12",
    sections: sections("tpl-ald-rounds", [
      {
        title: "Identifying summary",
        guidance: "Use a fictional label such as Sample Case A. Do not use a real name or record number.",
      },
      {
        title: "Active problems",
        guidance: "Present the problems that are guiding today's sample rounds discussion.",
      },
      {
        title: "Questions for the team",
        guidance: "List decisions or uncertainties the sample team should discuss.",
      },
    ]),
  },
  {
    id: "tpl-har-admission",
    organizationId: "harborlight",
    departmentId: "har-primary",
    name: "Admission Assessment",
    description: "Department sample for an initial primary-care admission assessment.",
    workflow: "Admission",
    status: "Active",
    createdAt: "2025-01-20",
    updatedAt: "2025-01-20",
    sections: sections("tpl-har-admission", [
      {
        title: "Reason for admission",
        guidance: "State the synthetic reason the fictional person needs admission.",
      },
      {
        title: "History",
        guidance: "Summarize the relevant history using placeholder details only.",
      },
      {
        title: "Assessment",
        guidance: "Record the initial impression and the problems to address first.",
      },
      {
        title: "Initial plan",
        guidance: "Outline the sample monitoring, consultations, and next review.",
      },
    ]),
  },
  {
    id: "tpl-ced-progress",
    organizationId: "cedarline",
    departmentId: "ced-pediatrics",
    name: "General Progress Note",
    description: "Department sample of the general progress note for pediatrics.",
    workflow: "Progress note",
    status: "Active",
    createdAt: "2024-07-01",
    updatedAt: "2024-07-01",
    sections: sections("tpl-ced-progress", [
      {
        title: "Interval history",
        guidance: "Describe the interval for this fictional pediatric encounter in general terms.",
      },
      {
        title: "Assessment",
        guidance: "List the current problems without naming a real child or family.",
      },
      {
        title: "Plan",
        guidance: "Record the sample plan and who will review it next.",
      },
    ]),
  },
  {
    id: "tpl-wes-signout",
    organizationId: "westford",
    departmentId: null,
    name: "Patient Sign-out",
    description: "Inactive organization-wide handoff template retained for the sample directory.",
    workflow: "Handoff",
    status: "Inactive",
    createdAt: "2025-11-28",
    updatedAt: "2026-02-04",
    sections: sections("tpl-wes-signout", [
      {
        title: "Summary",
        guidance: "Keep a short synthetic summary for the covering clinician.",
      },
      {
        title: "Pending items",
        guidance: "List unfinished sample tasks. Deactivating this template does not remove these sections.",
      },
    ]),
  },
  {
    id: "tpl-mer-soap",
    organizationId: "meridian",
    departmentId: "mer-emergency",
    name: "SOAP Clinical Note",
    description: "Inactive emergency department sample of the SOAP note.",
    workflow: "Clinical note",
    status: "Inactive",
    createdAt: "2024-05-02",
    updatedAt: "2025-01-14",
    sections: sections("tpl-mer-soap", [
      {
        title: "Subjective",
        guidance: "Capture the presenting concern for the fictional emergency encounter.",
      },
      {
        title: "Objective",
        guidance: "Record placeholder examination findings only.",
      },
      {
        title: "Assessment",
        guidance: "State the sample impression at the time of review.",
      },
      {
        title: "Plan",
        guidance: "List disposition and follow-up placeholders.",
      },
    ]),
  },
  {
    id: "tpl-ald-admission",
    organizationId: "alder",
    departmentId: null,
    name: "Admission Assessment",
    description: "Inactive organization-wide admission template kept in the sample set.",
    workflow: "Admission",
    status: "Inactive",
    createdAt: "2023-11-02",
    updatedAt: "2024-08-19",
    sections: sections("tpl-ald-admission", [
      {
        title: "Reason for admission",
        guidance: "State why this fictional admission is being documented.",
      },
      {
        title: "Initial plan",
        guidance: "Outline the first sample steps. The inactive status leaves this section in place.",
      },
    ]),
  },
  {
    id: "tpl-wes-rounds",
    organizationId: "westford",
    departmentId: "wes-family",
    name: "Daily Rounds Presentation",
    description: "Inactive family-medicine sample for a short rounds presentation.",
    workflow: "Rounds",
    status: "Inactive",
    createdAt: "2025-12-02",
    updatedAt: "2026-02-04",
    sections: sections("tpl-wes-rounds", [
      {
        title: "Identifying summary",
        guidance: "Use a fictional case label. Do not enter a real name.",
      },
      {
        title: "Active problems",
        guidance: "List the problems for this sample rounds presentation.",
      },
    ]),
  },
  {
    id: "tpl-mer-admission",
    organizationId: "meridian",
    departmentId: "mer-medicine",
    name: "Admission Assessment",
    description: "Department sample for a hospital-medicine admission assessment.",
    workflow: "Admission",
    status: "Active",
    createdAt: "2024-08-12",
    updatedAt: "2024-08-12",
    sections: sections("tpl-mer-admission", [
      {
        title: "Reason for admission",
        guidance: "State the synthetic reason for the hospital-medicine admission.",
      },
      {
        title: "History",
        guidance: "Summarize the relevant history with placeholder details.",
      },
      {
        title: "Assessment",
        guidance: "Record the initial problem list for this sample admission.",
      },
      {
        title: "Initial plan",
        guidance: "Outline monitoring and the next sample review.",
      },
    ]),
  },
];
