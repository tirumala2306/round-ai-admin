import { Link } from 'react-router-dom';
import type { AdminSettings } from '@/api/schemas';
import { Badge } from '@/components/ui/badge';
import { formatWhen } from '@/lib/format';

type Props = {
  settings?: AdminSettings;
  loading?: boolean;
};

export function ChatDashboardCard({ settings, loading }: Props) {
  const chatOn = settings?.chat_enabled !== false;
  const holdOn = !!settings?.chat_legal_hold;

  return (
    <section
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
      aria-labelledby="chat-dash-heading"
      data-testid="chat-dashboard-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="chat-dash-heading" className="text-lg font-medium">
            Team chat
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Status only — no message content. Manage controls in Settings.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <Link
            to="/settings#chat"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Open chat settings
          </Link>
          <Link
            to="/settings/chat-metrics"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Chat metrics
          </Link>
        </div>
      </div>

      {loading && !settings ? (
        <p className="mt-4 text-sm text-[var(--muted)]">Loading…</p>
      ) : (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Chat</dt>
            <dd className="mt-1">
              <Badge tone={chatOn ? 'ok' : 'danger'}>{chatOn ? 'Enabled' : 'Disabled'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Retention</dt>
            <dd className="mt-1 tabular-nums">
              {settings?.chat_retention_days ?? '—'} days
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Legal hold</dt>
            <dd className="mt-1">
              <Badge tone={holdOn ? 'danger' : 'ok'}>{holdOn ? 'Active' : 'Off'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Push devices</dt>
            <dd className="mt-1 tabular-nums">{settings?.push?.registered_devices ?? '—'}</dd>
          </div>
        </dl>
      )}

      {holdOn && (
        <p className="mt-3 text-sm text-[var(--danger)]" role="status">
          Legal hold is on — purge is blocked until cleared.
          {settings?.legal_hold_last_change?.at
            ? ` Last change ${formatWhen(settings.legal_hold_last_change.at)}.`
            : ''}
        </p>
      )}
    </section>
  );
}
