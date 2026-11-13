import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { fetchPurgePreview, fetchSettings, runChatPurge } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import {
  canPerformChatAction,
  retentionPurgeSameActorAdvisory,
} from '@/features/chat/capabilities';
import { formatWhen } from '@/lib/format';

function detailNum(detail: unknown, key: string): number | null {
  if (!detail || typeof detail !== 'object') return null;
  const v = (detail as Record<string, unknown>)[key];
  return typeof v === 'number' ? v : null;
}

export function ChatPurgePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ackDestroy, setAckDestroy] = useState(false);
  const [auditNote, setAuditNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowed = canPerformChatAction(user?.role, 'run_purge');

  const settings = useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings });
  const preview = useQuery({
    queryKey: ['chat-purge-preview', 'configured'],
    queryFn: () => fetchPurgePreview(),
    enabled: allowed,
  });

  const sodNote = retentionPurgeSameActorAdvisory(
    user?.id,
    settings.data?.retention_last_change?.actor_id,
  );

  const purge = useMutation({
    mutationFn: runChatPurge,
    onSuccess: async (result) => {
      setConfirmOpen(false);
      setAckDestroy(false);
      setError(null);
      if (result.skipped) {
        setAuditNote(
          `Purge skipped (${result.reason || 'blocked'}). No messages deleted.`,
        );
      } else {
        const at = result.last_purge?.at ? formatWhen(result.last_purge.at) : 'just now';
        const by = result.last_purge?.actor_id || 'admin';
        setAuditNote(
          `Purge completed: ${result.purged} message(s) deleted · ${at} · actor ${by}. Recorded in audit log (admin_chat_purge).`,
        );
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['chat-purge-preview'] }),
        qc.invalidateQueries({ queryKey: ['admin-settings'] }),
        qc.invalidateQueries({ queryKey: ['admin-audit'] }),
      ]);
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const p = preview.data;
  const blocked = !!p?.blocked || !!settings.data?.chat_legal_hold;
  const blockedReason = p?.blocked_reason || (settings.data?.chat_legal_hold ? 'legal_hold' : null);
  const eligible = p?.eligible_count ?? 0;
  const confirmWord = String(eligible);
  const lastPurge = p?.last_purge ?? settings.data?.last_purge;
  const lastPurgedCount = detailNum(lastPurge?.detail, 'purged');

  const canOpenConfirm = allowed && !blocked && eligible > 0 && !preview.isLoading && !preview.isError;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Purge expired chat</h1>
        <p className="text-sm text-[var(--danger)]" role="alert">
          Not allowed for your role. Chat purge requires admin (backend-enforced).
        </p>
        <Link to="/settings#chat" className="text-sm text-[var(--accent)] underline-offset-2 hover:underline">
          ← Chat settings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm text-[var(--muted)]">
          <Link to="/settings#chat" className="text-[var(--accent)] underline-offset-2 hover:underline">
            ← Chat settings
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Purge expired chat</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Counts and metadata only — never message text. This screen does not schedule purge;
          any schedule is a backend concern. Runs only when you confirm here.
        </p>
      </header>

      {sodNote && (
        <p
          className="rounded-md border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--card))] p-3 text-sm"
          role="status"
          data-testid="purge-sod-advisory"
        >
          {sodNote}
        </p>
      )}

      {auditNote && (
        <p className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm" role="status" data-testid="purge-audit-note">
          {auditNote}
        </p>
      )}
      {error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <h2 className="font-medium">Current policy</h2>
        {preview.isError && (
          <p className="text-sm text-[var(--danger)]">{userFacingMessage(preview.error)}</p>
        )}
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Retention days</dt>
            <dd className="text-lg font-medium tabular-nums">
              {p?.retention_days ?? settings.data?.chat_retention_days ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Messages eligible</dt>
            <dd className="text-lg font-medium tabular-nums" data-testid="purge-eligible-count">
              {preview.isLoading ? '…' : eligible}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--muted)]">Cutoff</dt>
            <dd className="tabular-nums text-sm">{p?.cutoff ? formatWhen(p.cutoff) : '—'}</dd>
          </div>
        </dl>

        {blocked ? (
          <div
            className="rounded-md border border-[color-mix(in_oklab,var(--danger)_35%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] p-3 text-sm"
            role="alert"
            data-testid="purge-blocked"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="danger">Blocked</Badge>
              <span className="font-medium">Purge cannot run</span>
            </div>
            <p className="mt-1 text-[var(--muted)]">
              {blockedReason === 'legal_hold'
                ? 'Legal hold is active. Clear the hold in Chat settings before purging. Affected data is retained for compliance.'
                : `Blocked: ${blockedReason || 'unknown reason'}.`}
            </p>
            <Link
              to="/settings#chat"
              className="mt-2 inline-block text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Manage legal hold
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            No legal hold. Purge deletes messages older than retention and cannot be undone.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-2">
        <h2 className="font-medium">Last purge run</h2>
        {lastPurge ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[var(--muted)]">When</dt>
              <dd>{formatWhen(lastPurge.at)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">By</dt>
              <dd>
                {lastPurge.actor_id ? (
                  <Link
                    className="text-[var(--accent)] underline-offset-2 hover:underline"
                    to={`/users?highlight=${encodeURIComponent(lastPurge.actor_id)}`}
                  >
                    {lastPurge.actor_id}
                  </Link>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Deleted</dt>
              <dd className="tabular-nums">{lastPurgedCount ?? '—'}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-[var(--muted)]">No purge recorded yet.</p>
        )}
        <p className="text-xs text-[var(--muted)]">
          Schedule status: none in this panel. Backend does not expose an automatic purge schedule to the UI.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="danger"
          disabled={!canOpenConfirm || purge.isPending}
          onClick={() => {
            setAckDestroy(false);
            setConfirmOpen(true);
          }}
        >
          Run purge…
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void preview.refetch()}
          disabled={preview.isFetching}
        >
          Refresh counts
        </Button>
      </div>

      <ConfirmTypeDialog
        open={confirmOpen}
        title="Permanently purge expired messages?"
        description={
          <div className="space-y-2">
            <p>
              This will delete{' '}
              <strong className="tabular-nums" data-testid="purge-confirm-count">
                {eligible}
              </strong>{' '}
              message(s) older than retention. Type that exact number to confirm.
            </p>
            <p>No message content is shown here. Deletion cannot be undone.</p>
          </div>
        }
        confirmWord={confirmWord}
        confirmLabel="Purge now"
        danger
        busy={purge.isPending}
        extraValid={ackDestroy}
        onClose={() => {
          setConfirmOpen(false);
          setAckDestroy(false);
        }}
        onConfirm={async () => {
          await purge.mutateAsync();
        }}
      >
        <label className="flex items-start gap-2 text-sm" htmlFor="purge-destroy-ack">
          <input
            id="purge-destroy-ack"
            type="checkbox"
            className="mt-1"
            checked={ackDestroy}
            onChange={(e) => setAckDestroy(e.target.checked)}
            data-testid="purge-destroy-ack"
          />
          <span>This permanently deletes data and cannot be undone</span>
        </label>
      </ConfirmTypeDialog>
    </div>
  );
}
