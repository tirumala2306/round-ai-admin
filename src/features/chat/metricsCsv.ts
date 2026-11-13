import type { ChatMetrics } from '@/api/schemas';

const HEADERS = [
  'day',
  'active_channels',
  'messages_posted',
  'summarize_requests',
  'push_registrations',
  'rate_limit_rejections',
  'spam_rejections',
] as const;

function csvEscape(v: string | number): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Aggregates only — never message text or participant lists. */
export function chatMetricsToCsv(metrics: ChatMetrics): string {
  const lines = [HEADERS.join(',')];
  for (const d of metrics.days) {
    lines.push(
      [
        d.day,
        d.active_channels,
        d.messages_posted,
        d.summarize_requests,
        d.push_registrations,
        d.rate_limit_rejections,
        d.spam_rejections,
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  lines.push(
    [
      'TOTAL',
      metrics.totals.active_channels,
      metrics.totals.messages_posted,
      metrics.totals.summarize_requests,
      metrics.totals.push_registrations,
      metrics.totals.rate_limit_rejections,
      metrics.totals.spam_rejections,
    ]
      .map(csvEscape)
      .join(','),
  );
  return `${lines.join('\n')}\n`;
}
