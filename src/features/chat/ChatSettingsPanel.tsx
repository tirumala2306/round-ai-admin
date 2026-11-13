import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  fetchHoldHistory,
  fetchPurgePreview,
  fetchSettings,
  updateSettings,
} from '@/api/admin';
import type { AdminSettings } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatWhen } from '@/lib/format';

type DialogKind = 'toggle' | 'retention' | 'hold' | null;

function ActorLink({ id }: { id: string | null | undefined }) {
  if (!id) return <span className="text-[var(--muted)]">system</span>;
  return (
    <Link className="text-[var(--accent)] underline-offset-2 hover:underline" to={`/users?highlight=${encodeURIComponent(id)}`}>
      {id}
    </Link>
  );
}

function LastChange({
  label,
  meta,
}: {
  label: string;
  meta: AdminSettings['retention_last_change'];
}) {
  if (!meta) {
    return (
      <p className="text-xs text-[var(--muted)]">
        {label}: no recorded change yet
      </p>
    );
  }
  return (
    <p className="text-xs text-[var(--muted)]">
      {label}: {formatWhen(meta.at)} by <ActorLink id={meta.actor_id} />
    </p>
  );
}

type Props = {
  /** When provided, skip the settings query (parent already loaded). */
  settings?: AdminSettings;
};

export function ChatSettingsPanel({ settings: settingsProp }: Props) {
  const qc = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
    enabled: !settingsProp,
  });
  const s = settingsProp ?? settingsQuery.data;

  const holdHistory = useQuery({
    queryKey: ['chat-hold-history'],
    queryFn: () => fetchHoldHistory({ limit: 20 }),
  });

  const [retentionDraft, setRetentionDraft] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (s?.chat_retention_days != null) {
      setRetentionDraft(String(s.chat_retention_days));
    }
  }, [s?.chat_retention_days]);

  const proposedDays = Number(retentionDraft);
  const proposedValid =
    Number.isInteger(proposedDays) && proposedDays >= 1 && proposedDays <= 3650;
  const retentionChanged =
    proposedValid && s?.chat_retention_days != null && proposedDays !== s.chat_retention_days;

  const preview = useQuery({
    queryKey: ['chat-purge-preview', proposedValid ? proposedDays : s?.chat_retention_days],
    queryFn: () => fetchPurgePreview(proposedValid ? proposedDays : undefined),
    enabled: !!s && (proposedValid || s.chat_retention_days != null),
  });

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['admin-settings'] }),
      qc.invalidateQueries({ queryKey: ['chat-hold-history'] }),
      qc.invalidateQueries({ queryKey: ['chat-purge-preview'] }),
    ]);
  };

  const toggleChat = useMutation({
    mutationFn: (enabled: boolean) => updateSettings({ chat_enabled: enabled }),
    onSuccess: async (_data, enabled) => {
      setDialog(null);
      setError(null);
      setMessage(enabled
        ? 'Chat enabled. Mobile app can show chat and realtime again.'
        : 'Chat disabled. Mobile app hides chat and stops realtime; existing data is kept.');
      await invalidate();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const saveRetention = useMutation({
    mutationFn: () => updateSettings({ chat_retention_days: proposedDays }),
    onSuccess: async () => {
      setDialog(null);
      setError(null);
      setMessage(`Retention set to ${proposedDays} days. The next purge permanently deletes older messages.`);
      await invalidate();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const toggleHold = useMutation({
    mutationFn: (hold: boolean) =>
      updateSettings({
        chat_legal_hold: hold,
        chat_legal_hold_reason: holdReason.trim(),
      }),
    onSuccess: async (_data, hold) => {
      setDialog(null);
      setHoldReason('');
      setError(null);
      setMessage(hold
        ? 'Legal hold on. Purge is blocked until the hold is cleared.'
        : 'Legal hold cleared. Purge may run again per retention policy.');
      await invalidate();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const chatOn = s?.chat_enabled !== false;
  const holdOn = !!s?.chat_legal_hold;
  const reasonOk = holdReason.trim().length >= 3;

  return (
    <section
      id="chat"
      className="scroll-mt-6 space-y-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
      aria-labelledby="chat-settings-heading"
    >
      <header>
        <h2 id="chat-settings-heading" className="font-medium">
          Chat
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Governance for team chat. The panel never shows message text, patient channel titles, or conversation content.
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link
            to="/settings/chat-purge"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Open guarded purge screen
          </Link>
          <Link
            to="/settings/chat-export"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Compliance export
          </Link>
          <Link
            to="/settings/chat-metrics"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Chat metrics
          </Link>
        </p>
      </header>

      {message && <p className="text-sm text-[var(--accent)]" role="status">{message}</p>}
      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}

      <div className="space-y-3 border-b border-[var(--border)] pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-medium">Chat enabled</h3>
          <Badge tone={chatOn ? 'ok' : 'danger'}>{chatOn ? 'On' : 'Off'}</Badge>
          <Button
            type="button"
            variant={chatOn ? 'danger' : 'primary'}
            onClick={() => setDialog('toggle')}
          >
            {chatOn ? 'Disable chat' : 'Enable chat'}
          </Button>
        </div>
        <p className="text-sm text-[var(--muted)]">
          When off, the mobile app hides chat and stops realtime. Existing messages and channels are kept.
        </p>
      </div>

      <div className="space-y-3 border-b border-[var(--border)] pb-5">
        <h3 className="text-sm font-medium">Retention policy</h3>
        <p className="text-sm text-[var(--muted)]">
          Global days to keep messages (patient threads use the same period until a separate policy is confirmed).
          Changing retention does not delete immediately — the <strong>next purge</strong> permanently deletes
          messages older than the new value.
        </p>
        <LastChange label="Last changed" meta={s?.retention_last_change} />
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-36">
            <Label htmlFor="chat-retention-days">Days (1–3650)</Label>
            <Input
              id="chat-retention-days"
              inputMode="numeric"
              value={retentionDraft}
              onChange={(e) => setRetentionDraft(e.target.value.replace(/[^\d]/g, ''))}
            />
          </div>
          <Button
            type="button"
            disabled={!retentionChanged || saveRetention.isPending}
            onClick={() => setDialog('retention')}
          >
            Change retention
          </Button>
        </div>
        {preview.data && (
          <p className="text-sm" data-testid="retention-preview-count">
            Dry-run under {preview.data.retention_days} days:{' '}
            <strong className="tabular-nums">{preview.data.eligible_count}</strong> messages would be eligible
            for purge
            {preview.data.blocked ? ' (blocked while legal hold is on)' : ''}.
          </p>
        )}
        {preview.isError && (
          <p className="text-sm text-[var(--danger)]">{userFacingMessage(preview.error)}</p>
        )}
      </div>

      <div className="space-y-3 border-b border-[var(--border)] pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-medium">Legal hold</h3>
          <Badge tone={holdOn ? 'danger' : 'ok'}>{holdOn ? 'Hold active' : 'No hold'}</Badge>
          <Button
            type="button"
            variant={holdOn ? 'secondary' : 'danger'}
            onClick={() => {
              setHoldReason('');
              setDialog('hold');
            }}
          >
            {holdOn ? 'Clear hold' : 'Set hold'}
          </Button>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Global hold only (per-user / per-channel deferred). While a hold applies, purge must stay disabled —
          the UI will block it and state why.
        </p>
        <LastChange label="Last hold change" meta={s?.legal_hold_last_change} />

        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Hold history</h4>
          {holdHistory.isError && (
            <p className="mt-1 text-sm text-[var(--danger)]">{userFacingMessage(holdHistory.error)}</p>
          )}
          {holdHistory.data?.rows.length ? (
            <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm" data-testid="hold-history">
              {holdHistory.data.rows.map((row) => (
                <li key={row.id} className="border-b border-[var(--border)] pb-2 last:border-0">
                  <span className="font-medium">{row.hold ? 'Set' : 'Cleared'}</span>
                  {' · '}
                  {formatWhen(row.at)}
                  {' · '}
                  <ActorLink id={row.actor_id} />
                  <p className="text-[var(--muted)]">{row.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-[var(--muted)]">No hold changes recorded.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium">Limits (read-only)</h3>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Max message size</dt>
              <dd className="tabular-nums">{s?.chat_limits?.max_message_body ?? '—'} chars</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Rate limit</dt>
              <dd className="tabular-nums">{s?.chat_limits?.rate_per_minute ?? '—'} / min</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="text-sm font-medium">Push (read-only)</h3>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Registered devices</dt>
              <dd className="tabular-nums" data-testid="push-device-count">
                {s?.push?.registered_devices ?? '—'}
              </dd>
            </div>
          </dl>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Counts only. Device tokens are never shown.
          </p>
        </div>
      </div>

      <ConfirmTypeDialog
        open={dialog === 'toggle'}
        title={chatOn ? 'Disable team chat?' : 'Enable team chat?'}
        description={
          chatOn
            ? 'The mobile app will hide chat and stop realtime. Existing data is kept. Type DISABLE CHAT to confirm.'
            : 'Type ENABLE CHAT to turn chat back on for the mobile app.'
        }
        confirmWord={chatOn ? 'DISABLE CHAT' : 'ENABLE CHAT'}
        confirmLabel={chatOn ? 'Disable chat' : 'Enable chat'}
        danger={chatOn}
        busy={toggleChat.isPending}
        onClose={() => setDialog(null)}
        onConfirm={async () => { await toggleChat.mutateAsync(!chatOn); }}
      />

      <ConfirmTypeDialog
        open={dialog === 'retention'}
        title="Change chat retention?"
        description={
          <div className="space-y-2">
            <p>
              Next purge will permanently delete messages older than{' '}
              <strong className="tabular-nums">{proposedDays}</strong> days
              {preview.data ? (
                <>
                  {' '}
                  (~<strong className="tabular-nums">{preview.data.eligible_count}</strong> currently eligible
                  under that policy)
                </>
              ) : null}
              . This cannot be undone after purge runs.
            </p>
            <p>Type CHANGE RETENTION to confirm.</p>
          </div>
        }
        confirmWord="CHANGE RETENTION"
        confirmLabel="Save retention"
        danger
        busy={saveRetention.isPending}
        onClose={() => setDialog(null)}
        onConfirm={async () => { await saveRetention.mutateAsync(); }}
      />

      <ConfirmTypeDialog
        open={dialog === 'hold'}
        title={holdOn ? 'Clear legal hold?' : 'Set legal hold?'}
        description={
          holdOn
            ? 'Clearing the hold allows purge again under the retention policy. Provide a reason and type CLEAR HOLD.'
            : 'While hold is on, purge is blocked for all chat data. Provide a reason and type SET HOLD.'
        }
        confirmWord={holdOn ? 'CLEAR HOLD' : 'SET HOLD'}
        confirmLabel={holdOn ? 'Clear hold' : 'Set hold'}
        danger={!holdOn}
        busy={toggleHold.isPending}
        extraValid={reasonOk}
        onClose={() => setDialog(null)}
        onConfirm={async () => { await toggleHold.mutateAsync(!holdOn); }}
      >
        <div>
          <Label htmlFor="hold-reason">Reason (required)</Label>
          <Input
            id="hold-reason"
            value={holdReason}
            onChange={(e) => setHoldReason(e.target.value)}
            placeholder="e.g. Subpoena SAMPLE-CASE-001"
            autoComplete="off"
            autoFocus
          />
        </div>
      </ConfirmTypeDialog>
    </section>
  );
}
