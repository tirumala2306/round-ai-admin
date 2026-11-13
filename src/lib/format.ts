export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function monthStartIso(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function todayIso(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function sumUsage(
  rows: { day: string; calls: number; input_tokens: number; output_tokens: number }[],
  day: string | null,
) {
  const filtered = day ? rows.filter((r) => r.day === day) : rows;
  return filtered.reduce(
    (acc, r) => {
      acc.calls += r.calls;
      acc.tokens += r.input_tokens + r.output_tokens;
      return acc;
    },
    { calls: 0, tokens: 0 },
  );
}

export function downloadTextFile(filename: string, text: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
