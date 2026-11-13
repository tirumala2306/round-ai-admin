import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  fetchActivity,
  fetchQuestionAnalytics,
  fetchSettings,
  fetchUsage,
  fetchUsers,
} from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { monthStartIso, todayIso } from '@/lib/format';

export function AnalyticsPage() {
  const [since, setSince] = useState(monthStartIso());
  const [until, setUntil] = useState(todayIso());
  const [userId, setUserId] = useState('');

  const settings = useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });
  const usage = useQuery({
    queryKey: ['admin-usage', since],
    queryFn: () => fetchUsage(since),
  });
  const activity = useQuery({
    queryKey: ['admin-activity', since, until, userId],
    queryFn: () =>
      fetchActivity({
        since: since || undefined,
        until: until ? `${until}T23:59:59.999Z` : undefined,
        user_id: userId || undefined,
      }),
  });
  const questions = useQuery({
    queryKey: ['admin-question-analytics'],
    queryFn: fetchQuestionAnalytics,
  });

  const usageFiltered = useMemo(() => {
    const rows = usage.data || [];
    if (!until) return rows;
    return rows.filter((r) => r.day <= until);
  }, [usage.data, until]);

  const emailById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users.data || []) m.set(u.id, u.email);
    return m;
  }, [users.data]);

  const individualsOn = questions.data?.individual_learner_analytics
    ?? settings.data?.show_individual_learner_analytics
    ?? false;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Usage and analytics</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Aggregated AI usage, audit action counts, and question stats by topic. No clinical text.
        </p>
      </header>

      <form className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="since">From (day)</Label>
          <Input id="since" type="date" value={since} onChange={(e) => setSince(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="until">To (day)</Label>
          <Input id="until" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="actor">Activity user filter</Label>
          <select
            id="actor"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">All users</option>
            {(users.data || []).map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>
      </form>

      <section>
        <h2 className="text-lg font-medium">AI usage (calls / tokens)</h2>
        {usage.isError && <p className="mt-2 text-sm text-[var(--danger)]" role="alert">{userFacingMessage(usage.error)}</p>}
        <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Day</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Calls</th>
                <th className="px-4 py-3 font-medium">Input tokens</th>
                <th className="px-4 py-3 font-medium">Output tokens</th>
              </tr>
            </thead>
            <tbody>
              {usageFiltered.map((r) => (
                <tr key={`${r.email}-${r.day}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">{r.day}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3 tabular-nums">{r.calls}</td>
                  <td className="px-4 py-3 tabular-nums">{r.input_tokens.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular-nums">{r.output_tokens.toLocaleString()}</td>
                </tr>
              ))}
              {!usage.isLoading && !usageFiltered.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">No usage in range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">Activity by action</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{activity.data?.note || 'Action counts from the audit log.'}</p>
        {activity.isError && <p className="mt-2 text-sm text-[var(--danger)]" role="alert">{userFacingMessage(activity.error)}</p>}
        <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {(activity.data?.rows || []).map((r, i) => (
                <tr key={`${r.actor_id}-${r.action}-${i}`} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">{r.actor_id ? (emailById.get(r.actor_id) || r.actor_id) : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.action}</td>
                  <td className="px-4 py-3 tabular-nums">{r.count}</td>
                </tr>
              ))}
              {!activity.isLoading && !(activity.data?.rows.length) && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-[var(--muted)]">No activity rows</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">Question analytics by topic</h2>
        {questions.isError && <p className="mt-2 text-sm text-[var(--danger)]" role="alert">{userFacingMessage(questions.error)}</p>}
        <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Topic</th>
                <th className="px-4 py-3 font-medium">Attempts</th>
                <th className="px-4 py-3 font-medium">% correct</th>
                <th className="px-4 py-3 font-medium">Avg seconds</th>
                <th className="px-4 py-3 font-medium">Reported</th>
              </tr>
            </thead>
            <tbody>
              {(questions.data?.by_topic || []).map((r) => (
                <tr key={r.topic} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">{r.topic}</td>
                  <td className="px-4 py-3 tabular-nums">{r.attempts}</td>
                  <td className="px-4 py-3 tabular-nums">{r.pct_correct ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums">{r.avg_seconds ?? '—'}</td>
                  <td className="px-4 py-3 tabular-nums">{r.reported_count ?? 0}</td>
                </tr>
              ))}
              {!questions.isLoading && !(questions.data?.by_topic.length) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">No attempts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {individualsOn && questions.data?.individuals && (
          <div className="mt-6">
            <h3 className="font-medium">Individual learner rows</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Enabled via <code className="font-mono text-xs">show_individual_learner_analytics</code>. Privacy/HR sensitive.
            </p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Topic</th>
                    <th className="px-4 py-3 font-medium">Attempts</th>
                    <th className="px-4 py-3 font-medium">% correct</th>
                    <th className="px-4 py-3 font-medium">Avg seconds</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.data.individuals.map((r) => (
                    <tr key={`${r.user_id}-${r.topic}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3">{r.email}</td>
                      <td className="px-4 py-3">{r.topic}</td>
                      <td className="px-4 py-3 tabular-nums">{r.attempts}</td>
                      <td className="px-4 py-3 tabular-nums">{r.pct_correct ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">{r.avg_seconds ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!individualsOn && (
          <p className="mt-4 text-sm text-[var(--muted)]" role="note">
            Individual learner analytics are off (default). Toggle in Settings only after policy confirmation.
          </p>
        )}
      </section>
    </div>
  );
}
