import { describe, expect, it, vi, afterEach } from 'vitest';
import { fetchAuditCsv } from './admin';
import { setToken, clearToken } from './token';

describe('fetchAuditCsv', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearToken();
  });

  it('returns CSV text and does not use localStorage', async () => {
    setToken('tok', 3600);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response('id,at,actor_id,action,patient_id,artifact_id,detail\n', {
          status: 200,
          headers: { 'Content-Type': 'text/csv' },
        }),
      ),
    );
    const text = await fetchAuditCsv({ limit: 10 });
    expect(text.startsWith('id,at')).toBe(true);
    expect(localStorage.length).toBe(0);
  });
});
