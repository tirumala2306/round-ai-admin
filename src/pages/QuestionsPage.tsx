import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMcqQueue, fetchMcqReports } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatWhen } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { value: '', label: 'Review queue' },
  { value: 'ai_generated_unreviewed', label: 'Unreviewed' },
  { value: 'reported', label: 'Reported' },
  { value: 'approved', label: 'Approved' },
  { value: 'retired', label: 'Retired' },
] as const;

function statusTone(s: string) {
  if (s === 'approved') return 'ok' as const;
  if (s === 'reported') return 'danger' as const;
  if (s === 'retired') return 'danger' as const;
  if (s === 'ai_generated_unreviewed') return 'warn' as const;
  return 'neutral' as const;
}

export function QuestionsPage() {
  const [status, setStatus] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const queue = useQuery({
    queryKey: ['mcq-queue', status, topic],
    queryFn: () =>
      fetchMcqQueue({
        status: status || undefined,
        topic: topic.trim() || undefined,
        limit: 200,
      }),
  });
  const reports = useQuery({ queryKey: ['mcq-reports'], queryFn: fetchMcqReports });

  const rows = useMemo(() => {
    let list = queue.data || [];
    if (difficulty) list = list.filter((m) => (m.difficulty || '') === difficulty);
    return list;
  }, [queue.data, difficulty]);

  const difficulties = useMemo(() => {
    const set = new Set<string>();
    for (const m of queue.data || []) if (m.difficulty) set.add(m.difficulty);
    return [...set].sort();
  }, [queue.data]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Teaching question bank</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Review AI-generated and reported questions. Text edits with versioning are not supported by the API — approve, retire, or return to unreviewed only.
        </p>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-[var(--border)]" role="tablist">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value || 'queue'}
            type="button"
            role="tab"
            aria-selected={status === t.value}
            className={cn(
              'px-3 py-2 text-sm',
              status === t.value
                ? 'border-b-2 border-[var(--accent)] font-medium text-[var(--accent)]'
                : 'text-[var(--muted)]',
            )}
            onClick={() => setStatus(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form className="grid gap-3 sm:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="topic">Topic filter</Label>
          <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. pneumonia" />
        </div>
        <div>
          <Label htmlFor="diff">Difficulty</Label>
          <select
            id="diff"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">Any</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </form>

      {queue.isError && (
        <p className="text-sm text-[var(--danger)]" role="alert">{userFacingMessage(queue.error)}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Difficulty</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">{m.topic}</td>
                <td className="px-4 py-3"><Badge tone={statusTone(m.status)}>{m.status}</Badge></td>
                <td className="px-4 py-3 text-[var(--muted)]">{m.difficulty || '—'}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{m.source || '—'}</td>
                <td className="px-4 py-3 text-xs">{formatWhen(m.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/questions/${m.id}`} className="text-[var(--accent)] hover:underline">Review</Link>
                </td>
              </tr>
            ))}
            {!queue.isLoading && !rows.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">No questions</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Reported issues</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Learner notes (plain text). Resolve by retiring or returning the question to unreviewed on its detail page.</p>
        <ul className="mt-4 space-y-3">
          {(reports.data || []).slice(0, 50).map((r) => (
            <li key={r.id} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{r.topic || r.mcq_id}</span>
                <Badge tone={statusTone(r.status || 'reported')}>{r.status || 'reported'}</Badge>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[var(--muted)]">{r.note || '(no note)'}</p>
              <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
                <span>{formatWhen(r.created_at)}</span>
                <Link to={`/questions/${r.mcq_id}`} className="text-[var(--accent)] hover:underline">Open question</Link>
              </div>
            </li>
          ))}
          {!reports.isLoading && !(reports.data || []).length && (
            <li className="text-sm text-[var(--muted)]">No reports</li>
          )}
        </ul>
      </section>
    </div>
  );
}
