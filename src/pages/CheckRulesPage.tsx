import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCheckRules, fetchUsers } from '@/api/admin';
import type { CheckRule } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { testMatchApprovedRules } from '@/features/check-rules/matching';
import { formatWhen } from '@/lib/format';
import { cn } from '@/lib/utils';

const TABS = ['draft', 'approved', 'retired'] as const;
type Tab = (typeof TABS)[number];

function statusTone(status: string): 'neutral' | 'ok' | 'warn' | 'danger' {
  if (status === 'approved') return 'ok';
  if (status === 'draft') return 'warn';
  if (status === 'retired') return 'danger';
  return 'neutral';
}

export function CheckRulesPage() {
  const [tab, setTab] = useState<Tab>('draft');
  const [testQuery, setTestQuery] = useState('');
  const rules = useQuery({ queryKey: ['check-rules', tab], queryFn: () => fetchCheckRules(tab) });
  const approved = useQuery({
    queryKey: ['check-rules', 'approved'],
    queryFn: () => fetchCheckRules('approved'),
  });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });

  const emailById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users.data || []) m.set(u.id, u.email);
    return m;
  }, [users.data]);

  const matches = useMemo(
    () => testMatchApprovedRules(approved.data || [], testQuery),
    [approved.data, testQuery],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reminder rules</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Check-rule library. Only <strong>approved</strong> rules appear in the app as “Prompt for your consideration”.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/reminders/new"
            className="inline-flex items-center rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-fg)]"
          >
            Create rule
          </Link>
          <Link
            to="/reminders/ai-draft"
            className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium"
          >
            Draft with AI
          </Link>
        </div>
      </header>

      <div className="flex gap-1 border-b border-[var(--border)]" role="tablist" aria-label="Rule status">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={cn(
              'px-4 py-2 text-sm capitalize',
              tab === t
                ? 'border-b-2 border-[var(--accent)] font-medium text-[var(--accent)]'
                : 'text-[var(--muted)]',
            )}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {rules.isError && (
        <p className="text-sm text-[var(--danger)]" role="alert">{userFacingMessage(rules.error)}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Match</th>
              <th className="px-4 py-3 font-medium">Approved</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {(rules.data || []).map((r: CheckRule) => (
              <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.ai_drafted && <Badge tone="warn">AI-drafted</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-[var(--muted)]">
                  {(r.match?.problem_keywords || []).slice(0, 3).join(', ') || '—'}
                  {(r.match?.icd_prefixes || []).length
                    ? ` · ICD ${(r.match?.icd_prefixes || []).slice(0, 3).join(', ')}`
                    : ''}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.approved_by
                    ? <>{emailById.get(r.approved_by) || r.approved_by}<br /><span className="text-[var(--muted)]">{formatWhen(r.approved_at)}</span></>
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/reminders/${r.id}`} className="text-[var(--accent)] hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!rules.isLoading && !(rules.data || []).length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">No {tab} rules</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Test match</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Type a problem name or ICD code. Matching uses the same keyword/prefix rules as the backend (approved rules only). No patient data.
        </p>
        <div className="mt-3 max-w-md">
          <Label htmlFor="test-match">Problem or ICD</Label>
          <Input
            id="test-match"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. pyelonephritis or N10"
          />
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {testQuery.trim() && !matches.length && (
            <li className="text-[var(--muted)]">No approved rules match.</li>
          )}
          {matches.map(({ rule, via }) => (
            <li key={rule.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] px-3 py-2">
              <span>
                {rule.name}
                <span className="ml-2 text-xs text-[var(--muted)]">via {via}</span>
              </span>
              <Link to={`/reminders/${rule.id}`} className="text-[var(--accent)] hover:underline">View</Link>
            </li>
          ))}
        </ul>
        {!approved.data && (
          <Button type="button" variant="secondary" className="mt-2" onClick={() => void approved.refetch()}>
            Load approved rules
          </Button>
        )}
      </section>
    </div>
  );
}
