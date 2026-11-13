import { describe, expect, it } from 'vitest';
import { ruleMatchesQuery, testMatchApprovedRules, wordingPreview } from './matching';
import { validateRuleDraft } from './validation';

describe('ruleMatchesQuery', () => {
  const rule = {
    match: { problem_keywords: ['pyelo', 'pyelonephritis'], icd_prefixes: ['N10'] },
  };

  it('matches problem keywords (includes)', () => {
    expect(ruleMatchesQuery(rule, 'Acute pyelonephritis').matched).toBe(true);
    expect(ruleMatchesQuery(rule, 'Acute pyelonephritis').via).toBe('keyword');
  });

  it('matches ICD prefixes', () => {
    expect(ruleMatchesQuery(rule, 'N10.9').via).toBe('icd');
    expect(ruleMatchesQuery(rule, 'J18').matched).toBe(false);
  });
});

describe('testMatchApprovedRules', () => {
  it('only returns approved matches', () => {
    const rules = [
      { id: '1', name: 'A', status: 'draft', match: { problem_keywords: ['aki'], icd_prefixes: [] } },
      { id: '2', name: 'B', status: 'approved', match: { problem_keywords: ['aki'], icd_prefixes: [] } },
    ];
    expect(testMatchApprovedRules(rules, 'aki').map((x) => x.rule.id)).toEqual(['2']);
  });
});

describe('wordingPreview / validation', () => {
  it('frames prompts for the app', () => {
    expect(wordingPreview([{ text: 'Check CVA', kind: 'exam' }])).toContain('Prompt for your consideration');
    expect(wordingPreview([{ text: 'Check CVA', kind: 'exam' }])).toContain('(exam) Check CVA');
  });

  it('requires match + prompts', () => {
    const issues = validateRuleDraft({
      name: '',
      problem_keywords: [],
      icd_prefixes: [],
      prompts: [{ text: '', kind: 'exam' }],
      compare_enabled: false,
      fact_label_keywords: [],
      lookback_days: 1,
    });
    expect(issues.length).toBeGreaterThan(1);
  });
});
