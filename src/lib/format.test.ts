import { describe, expect, it } from 'vitest';
import { sumUsage } from './format';

describe('sumUsage', () => {
  const rows = [
    { day: '2026-11-13', calls: 2, input_tokens: 10, output_tokens: 5 },
    { day: '2026-11-12', calls: 4, input_tokens: 20, output_tokens: 10 },
  ];

  it('sums a single day', () => {
    expect(sumUsage(rows, '2026-11-13')).toEqual({ calls: 2, tokens: 15 });
  });

  it('sums all days when day is null', () => {
    expect(sumUsage(rows, null)).toEqual({ calls: 6, tokens: 45 });
  });
});
