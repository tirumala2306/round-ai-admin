import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  __pendingExportCountForTests,
  abortPendingChatExports,
  downloadChatExport,
} from './exportDownload';
import { setToken, clearToken } from '@/api/token';
import { destroySession, establishSession } from '@/auth/session';

describe('downloadChatExport', () => {
  const revoke = vi.fn();
  const createObjectURL = vi.fn(() => 'blob:mock-export');
  const click = vi.fn();
  const remove = vi.fn();
  const appendChild = vi.fn((node: Node) => node);

  beforeEach(() => {
    clearToken();
    setToken('test-token', 3600);
    click.mockClear();
    remove.mockClear();
    appendChild.mockClear();
    createObjectURL.mockClear();
    revoke.mockClear();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL: revoke,
    });
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: ElementCreationOptions) => {
      if (tag === 'a') {
        const a = realCreate('a');
        a.click = click;
        a.remove = remove;
        return a;
      }
      return realCreate(tag, options);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChild as typeof document.body.appendChild);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    abortPendingChatExports();
    clearToken();
  });

  it('downloads opaque bytes, never returns body text, and revokes the blob URL', async () => {
    const phi = JSON.stringify({
      channels: [{ messages: [{ body: 'FAKE_EXPORT_BODY_DO_NOT_RENDER' }] }],
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(phi, {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        }),
      ),
    );

    const result = await downloadChatExport({
      teamId: 'team-aaa',
      reason: 'Litigation SAMPLE export',
    });

    expect(result.filename).toMatch(/roundsai-chat-export-team-aaa/);
    expect(result.cacheControl).toBe('no-store');
    expect(result).not.toHaveProperty('channels');
    expect(result).not.toHaveProperty('body');
    expect(click).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:mock-export');
  });

  it('aborts in-flight export when session is destroyed (idle logout)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        const signal = init?.signal;
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }),
    );

    const pending = downloadChatExport({
      teamId: 'team-bbb',
      reason: 'SAMPLE reason long enough',
    });

    // Allow fetch to register abort listener
    await Promise.resolve();
    expect(__pendingExportCountForTests()).toBe(1);

    establishSession('tok', 3600, {
      id: 'u',
      email: 'a@b.c',
      name: 'A',
      role: 'admin',
    });
    destroySession();
    expect(__pendingExportCountForTests()).toBe(0);

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
