import { describe, expect, it } from 'vitest';
import { chatMetricsToCsv } from './metricsCsv';
import type { ChatMetrics } from '@/api/schemas';

const sample: ChatMetrics = {
  from: '2026-11-01',
  to: '2026-11-13',
  days: [
    {
      day: '2026-11-12',
      active_channels: 2,
      messages_posted: 5,
      summarize_requests: 1,
      push_registrations: 0,
      rate_limit_rejections: 0,
      spam_rejections: 1,
    },
  ],
  totals: {
    active_channels: 2,
    messages_posted: 5,
    summarize_requests: 1,
    push_registrations: 0,
    rate_limit_rejections: 0,
    spam_rejections: 1,
  },
};

describe('chatMetricsToCsv', () => {
  it('exports aggregate columns only', () => {
    const csv = chatMetricsToCsv(sample);
    expect(csv).toContain('day,active_channels,messages_posted');
    expect(csv).toContain('2026-11-12,2,5,1,0,0,1');
    expect(csv).toContain('TOTAL,2,5,1,0,0,1');
    expect(csv).not.toMatch(/body|participant|channel_name|Morning huddle/i);
  });
});
