import { describe, expect, it } from 'vitest';
import {
  canPerformChatAction,
  CHAT_ROLE_MATRIX,
  retentionPurgeSameActorAdvisory,
} from './capabilities';

describe('chat capabilities', () => {
  it('allows admin and denies other roles for purge/export', () => {
    expect(canPerformChatAction('admin', 'run_purge')).toBe(true);
    expect(canPerformChatAction('admin', 'request_export')).toBe(true);
    expect(canPerformChatAction('resident', 'run_purge')).toBe(false);
    expect(canPerformChatAction('reviewer', 'request_export')).toBe(false);
    expect(canPerformChatAction(null, 'toggle_chat')).toBe(false);
  });

  it('documents recommended SoD in the matrix without inventing compliance access', () => {
    const purge = CHAT_ROLE_MATRIX.find((r) => r.action === 'run_purge');
    const exportRow = CHAT_ROLE_MATRIX.find((r) => r.action === 'request_export');
    expect(purge?.admin).toBe(true);
    expect(purge?.compliance).toBe('TBD');
    expect(exportRow?.compliance).toBe('TBD');
  });

  it('advises when same actor changed retention and would purge', () => {
    expect(retentionPurgeSameActorAdvisory('u1', 'u1')).toMatch(/different person/i);
    expect(retentionPurgeSameActorAdvisory('u1', 'u2')).toBeNull();
    expect(retentionPurgeSameActorAdvisory(null, 'u1')).toBeNull();
  });
});
