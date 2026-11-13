import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { fetchChatMetrics } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { chatMetricsToCsv } from '@/features/chat/metricsCsv';
import { downloadTextFile, monthStartIso, todayIso } from '@/lib/format';

export function ChatMetricsPage() {
  const [from, setFrom] = useState(monthStartIso());
  const [to, setTo] = useState(todayIso());
  const [exportError, setExportError] = useState<string | null>(null);

  const metrics = useQuery({
    queryKey: ['chat-metrics', from, to],
    queryFn: () => fetchChatMetrics({ from: from || undefined, to: to || undefined }),
  });

  const totals = metrics.data?.totals;
  const days = metrics.data?.days || [];

  const hasTextFields = useMemo(() => {
    const blob = JSON.stringify(metrics.data ?? {});
    return /"body"|"messages"|"participants"|"channel_name"|"title"/.test(blob);
  }, [metrics.data]);

  function onExportCsv() {
    setExportError(null);
    if (!metrics.data) {
      setExportError('Nothing to export yet.');
      return;
    }
    try {
      const csv = chatMetricsToCsv(metrics.data);
      downloadTextFile(`roundsai-chat-metrics-${from || 'from'}-${to || 'to'}.csv`, csv);
    } catch (e) {
      setExportError(userFacingMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link to="/settings#chat" className="text-[var(--accent)] underline-offset-2 hover:underline">
              ← Chat settings
            </Link>
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Chat metrics</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Daily aggregates only — no message text, channel titles, or participant lists. Per-user breakdown
            deferred pending privacy policy (Q5).
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onExportCsv} disabled={!metrics.data}>
          Export CSV
        </Button>
      </header>

      <form
        className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <Label htmlFor="metrics-from">From</Label>
          <Input id="metrics-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="metrics-to">To</Label>
          <Input id="metrics-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </form>

      {exportError && <p className="text-sm text-[var(--danger)]" role="alert">{exportError}</p>}
      {metrics.isError && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {userFacingMessage(metrics.error)}
        </p>
      )}
      {hasTextFields && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          Unexpected content fields in metrics response — do not use until fixed.
        </p>
      )}

      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6" data-testid="chat-metrics-totals">
        {[
          { label: 'Active channels', value: totals?.active_channels },
          { label: 'Messages', value: totals?.messages_posted },
          { label: 'Summarize reqs', value: totals?.summarize_requests },
          { label: 'Push regs', value: totals?.push_registrations },
          { label: 'Rate limits', value: totals?.rate_limit_rejections },
          { label: 'Spam rejects', value: totals?.spam_rejections },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {metrics.isLoading ? '…' : (c.value ?? 0)}
            </p>
          </div>
        ))}
      </section>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-left text-sm" data-testid="chat-metrics-table">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Day</th>
              <th className="px-4 py-3 font-medium">Active channels</th>
              <th className="px-4 py-3 font-medium">Messages</th>
              <th className="px-4 py-3 font-medium">Summarize</th>
              <th className="px-4 py-3 font-medium">Push regs</th>
              <th className="px-4 py-3 font-medium">Rate limit</th>
              <th className="px-4 py-3 font-medium">Spam</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 tabular-nums">{d.day}</td>
                <td className="px-4 py-3 tabular-nums">{d.active_channels}</td>
                <td className="px-4 py-3 tabular-nums">{d.messages_posted}</td>
                <td className="px-4 py-3 tabular-nums">{d.summarize_requests}</td>
                <td className="px-4 py-3 tabular-nums">{d.push_registrations}</td>
                <td className="px-4 py-3 tabular-nums">{d.rate_limit_rejections}</td>
                <td className="px-4 py-3 tabular-nums">{d.spam_rejections}</td>
              </tr>
            ))}
            {!metrics.isLoading && days.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                  No activity in this range
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {metrics.data?.note && (
        <p className="text-xs text-[var(--muted)]">{metrics.data.note}</p>
      )}
    </div>
  );
}
