import { describe, expect, it } from 'vitest';
import { moveSection, noteSkeletonPreview, validateTemplateDraft } from './validation';

describe('validateTemplateDraft', () => {
  it('accepts a valid draft', () => {
    const issues = validateTemplateDraft({
      key: 'progress',
      title: 'Progress note',
      sections: [
        { key: 'subjective', title: 'Subjective', source: 'clinician_subjective' },
        { key: 'plan', title: 'Plan', source: 'clinician_plan' },
      ],
    });
    expect(issues).toEqual([]);
  });

  it('rejects duplicate keys and bad sources', () => {
    const issues = validateTemplateDraft({
      key: 'Bad-Key',
      title: '',
      sections: [
        { key: 'a', title: 'A', source: 'clinician_plan' },
        { key: 'a', title: 'A2', source: 'bogus' },
      ],
    });
    expect(issues.some((i) => i.path === 'key')).toBe(true);
    expect(issues.some((i) => i.path === 'title')).toBe(true);
    expect(issues.some((i) => i.message.includes('Duplicate'))).toBe(true);
    expect(issues.some((i) => i.path === 'sections.1.source')).toBe(true);
  });
});

describe('moveSection / preview', () => {
  it('reorders sections', () => {
    const sections = [
      { key: 'a', title: 'A', source: 'facts' },
      { key: 'b', title: 'B', source: 'facts' },
    ];
    expect(moveSection(sections, 0, 1).map((s) => s.key)).toEqual(['b', 'a']);
  });

  it('builds plain-text skeleton', () => {
    const text = noteSkeletonPreview('Progress', [
      { key: 'subjective', title: 'Subjective', source: 'clinician_subjective' },
    ]);
    expect(text).toContain('# Progress');
    expect(text).toContain('## Subjective');
    expect(text).toContain('[clinician_subjective]');
  });
});
