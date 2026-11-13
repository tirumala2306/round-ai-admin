import { TEMPLATE_SOURCES, type TemplateSource } from '@/api/schemas';

/** Plain-language: what the AI / note validator may use for this section. */
export const SOURCE_HELP: Record<TemplateSource, string> = {
  clinician_history:
    'Only what the clinician typed or dictated for this history field (e.g. HPI). Empty → “[Title not entered]”. AI may not invent history.',
  clinician_subjective:
    'Only the clinician’s Subjective input. Empty → placeholder; model text without input is discarded.',
  clinician_exam:
    'Only the clinician’s Exam input. Empty → placeholder.',
  clinician_update:
    'Only the clinician’s interval/update input (ICU-style). Empty → placeholder.',
  clinician_support:
    'Only the clinician’s support input (vents, pressors, lines). Empty → placeholder.',
  clinician_plan:
    'Only the clinician’s plan (or saved plan for that date). Empty → placeholder; AI never invents the plan.',
  facts:
    'Confirmed chart facts only, cited by fact_ids. Empty is allowed (no placeholder flag).',
  facts_and_exam:
    'Confirmed chart facts plus clinician exam. Empty facts/exam allowed without inventing content.',
};

export function isTemplateSource(v: string): v is TemplateSource {
  return (TEMPLATE_SOURCES as readonly string[]).includes(v);
}

export { TEMPLATE_SOURCES };
