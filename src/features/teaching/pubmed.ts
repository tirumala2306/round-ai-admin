export function pubmedUrl(pmid: string | null | undefined): string | null {
  const id = String(pmid || '').trim();
  if (!id) return null;
  return `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(id)}/`;
}

export function asText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function optionLetters(options: unknown): { letter: string; text: string }[] {
  if (!options || typeof options !== 'object') return [];
  const o = options as Record<string, unknown>;
  return ['A', 'B', 'C', 'D', 'E'].map((letter) => ({
    letter,
    text: asText(o[letter]),
  }));
}
