import type { CheckRule } from '@/api/schemas';

/** Same semantics as backend `ruleMatches` in check_rules.js (approved corpus only for app; tester can pass any list). */
export function ruleMatchesQuery(
  rule: Pick<CheckRule, 'match'>,
  query: string,
): { matched: boolean; via: 'keyword' | 'icd' | null } {
  const q = query.trim();
  if (!q) return { matched: false, via: null };
  const match = rule.match || { problem_keywords: [], icd_prefixes: [] };
  const kws = match.problem_keywords || [];
  const prefixes = match.icd_prefixes || [];
  const lab = q.toLowerCase();
  if (kws.some((k) => lab.includes(k.toLowerCase()))) return { matched: true, via: 'keyword' };
  const code = q.toUpperCase();
  if (prefixes.some((pre) => code.startsWith(pre.toUpperCase()))) return { matched: true, via: 'icd' };
  return { matched: false, via: null };
}

export function testMatchApprovedRules(rules: CheckRule[], query: string) {
  return rules
    .filter((r) => r.status === 'approved')
    .map((r) => ({ rule: r, ...ruleMatchesQuery(r, query) }))
    .filter((x) => x.matched);
}

export const APP_FRAME = 'Prompt for your consideration';

export function wordingPreview(prompts: { text: string; kind: string }[]): string {
  const lines = [APP_FRAME, ''];
  for (const p of prompts) {
    if (!p.text.trim()) continue;
    lines.push(`• (${p.kind}) ${p.text.trim()}`);
  }
  return lines.join('\n').trimEnd();
}
