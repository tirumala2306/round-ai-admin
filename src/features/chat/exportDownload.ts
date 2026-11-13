import { mapApiError } from '@/api/errors';
import { getToken } from '@/api/token';

const baseUrl = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

/** Active export fetches — aborted on idle/logout so PHI downloads never outlive the session. */
const pending = new Set<AbortController>();

export function abortPendingChatExports() {
  for (const c of pending) {
    try {
      c.abort();
    } catch {
      /* ignore */
    }
  }
  pending.clear();
}

export type ChatExportDownloadResult = {
  /** Filename suggested for the saved file (no content). */
  filename: string;
  /** Byte length of the downloaded file (not a parsed row count). */
  bytes: number;
  cacheControl: string | null;
};

/**
 * Downloads compliance export as a file. Never JSON.parses or returns message content.
 * Blob URL is revoked immediately after the download click.
 */
export async function downloadChatExport(opts: {
  teamId: string;
  reason: string;
  signal?: AbortSignal;
}): Promise<ChatExportDownloadResult> {
  const token = getToken();
  if (!token) {
    throw mapApiError(401, { error: { code: 'unauthenticated', message: 'Sign in required' } });
  }

  const controller = new AbortController();
  pending.add(controller);
  const onOuter = () => controller.abort();
  opts.signal?.addEventListener('abort', onOuter);

  let objectUrl: string | null = null;
  try {
    const res = await fetch(`${baseUrl()}/admin/chat/export`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-store',
        Pragma: 'no-store',
      },
      body: JSON.stringify({ team_id: opts.teamId, reason: opts.reason }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* keep text for error mapping only */
      }
      throw mapApiError(res.status, body);
    }

    // Treat body as opaque bytes — do not parse into app state.
    const blob = await res.blob();
    const day = new Date().toISOString().slice(0, 10);
    const filename = `roundsai-chat-export-${opts.teamId.slice(0, 8)}-${day}.json`;
    objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();

    return {
      filename,
      bytes: blob.size,
      cacheControl: res.headers.get('Cache-Control'),
    };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    pending.delete(controller);
    opts.signal?.removeEventListener('abort', onOuter);
  }
}

/** Test helper */
export function __pendingExportCountForTests() {
  return pending.size;
}
