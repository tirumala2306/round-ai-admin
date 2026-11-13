import { TEMPLATE_SOURCES, type TemplateSection } from '@/api/schemas';
import { isTemplateSource } from './sources';

export type TemplateDraft = {
  key: string;
  title: string;
  sections: TemplateSection[];
};

export type ValidationIssue = { path: string; message: string };

const KEY_RE = /^[a-z_]+$/;

export function validateTemplateDraft(draft: TemplateDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!draft.key.trim()) {
    issues.push({ path: 'key', message: 'Template key is required' });
  } else if (!KEY_RE.test(draft.key)) {
    issues.push({ path: 'key', message: 'Key must be lowercase letters and underscores only (a-z_)' });
  }

  if (!draft.title.trim()) {
    issues.push({ path: 'title', message: 'Title is required' });
  }

  if (!draft.sections.length) {
    issues.push({ path: 'sections', message: 'At least one section is required' });
  }

  const keys = draft.sections.map((s) => s.key.trim());
  const seen = new Set<string>();
  draft.sections.forEach((s, i) => {
    const key = s.key.trim();
    const title = s.title.trim();
    if (!key) issues.push({ path: `sections.${i}.key`, message: 'Section key is required' });
    else if (!KEY_RE.test(key)) {
      issues.push({ path: `sections.${i}.key`, message: 'Section key must match a-z_ only' });
    }
    if (key && seen.has(key)) {
      issues.push({ path: `sections.${i}.key`, message: `Duplicate section key “${key}”` });
    }
    if (key) seen.add(key);
    if (!title) issues.push({ path: `sections.${i}.title`, message: 'Section title is required' });
    if (!isTemplateSource(s.source)) {
      issues.push({
        path: `sections.${i}.source`,
        message: `Source must be one of: ${TEMPLATE_SOURCES.join(', ')}`,
      });
    }
  });

  // unused but keeps keys array referenced for clarity in tests
  void keys;
  return issues;
}

export function moveSection(sections: TemplateSection[], index: number, dir: -1 | 1): TemplateSection[] {
  const next = [...sections];
  const j = index + dir;
  if (j < 0 || j >= next.length) return sections;
  const tmp = next[index]!;
  next[index] = next[j]!;
  next[j] = tmp;
  return next;
}

export function noteSkeletonPreview(title: string, sections: TemplateSection[]): string {
  const lines = [`# ${title || 'Untitled note'}`, ''];
  for (const s of sections) {
    lines.push(`## ${s.title || s.key || 'Section'}`);
    lines.push(`[${s.source}]`);
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
