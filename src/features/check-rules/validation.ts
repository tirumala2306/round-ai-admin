import { PROMPT_KINDS, type PromptKind } from '@/api/schemas';

export type RuleDraft = {
  name: string;
  problem_keywords: string[];
  icd_prefixes: string[];
  prompts: { text: string; kind: string }[];
  compare_enabled: boolean;
  fact_label_keywords: string[];
  lookback_days: number;
};

export type Issue = { path: string; message: string };

export function parseCsvList(text: string): string[] {
  return text
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function validateRuleDraft(d: RuleDraft): Issue[] {
  const issues: Issue[] = [];
  if (!d.name.trim()) issues.push({ path: 'name', message: 'Name is required' });
  if (!d.problem_keywords.length && !d.icd_prefixes.length) {
    issues.push({ path: 'match', message: 'Add at least one problem keyword or ICD prefix' });
  }
  const prompts = d.prompts.filter((p) => p.text.trim());
  if (!prompts.length) issues.push({ path: 'prompts', message: 'At least one prompt is required' });
  d.prompts.forEach((p, i) => {
    if (p.text.trim() && !(PROMPT_KINDS as readonly string[]).includes(p.kind)) {
      issues.push({ path: `prompts.${i}.kind`, message: `Invalid kind (use ${PROMPT_KINDS.join('|')})` });
    }
  });
  if (d.compare_enabled) {
    if (!d.fact_label_keywords.length) {
      issues.push({ path: 'compare', message: 'Compare needs fact label keywords, or turn it off' });
    }
    if (!Number.isInteger(d.lookback_days) || d.lookback_days < 1 || d.lookback_days > 7) {
      issues.push({ path: 'lookback_days', message: 'Lookback days must be an integer from 1 to 7' });
    }
  }
  return issues;
}

export function toApiBody(d: RuleDraft) {
  return {
    name: d.name.trim(),
    match: {
      problem_keywords: d.problem_keywords.map((k) => k.toLowerCase()),
      icd_prefixes: d.icd_prefixes.map((k) => k.toUpperCase()),
    },
    prompts: d.prompts
      .filter((p) => p.text.trim())
      .map((p) => ({ text: p.text.trim(), kind: p.kind as PromptKind })),
    compare: d.compare_enabled && d.fact_label_keywords.length
      ? {
          fact_label_keywords: d.fact_label_keywords.map((k) => k.toLowerCase()),
          lookback_days: d.lookback_days,
        }
      : null,
  };
}
