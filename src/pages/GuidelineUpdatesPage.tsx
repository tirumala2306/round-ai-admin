import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { approveGuidelineUpdate, createGuidelineUpdate, fetchGuidelineUpdates } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatWhen } from '@/lib/format';
import { cn } from '@/lib/utils';

export function GuidelineUpdatesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'all' | 'draft' | 'approved'>('all');
  const list = useQuery({
    queryKey: ['guideline-updates', tab],
    queryFn: () => fetchGuidelineUpdates(tab === 'all' ? undefined : tab),
  });
  const [form, setForm] = useState({
    topic: '',
    organization: '',
    title: '',
    published_date: '',
    url: '',
    summary_by_admin: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [approveAck, setApproveAck] = useState(false);

  const createMut = useMutation({
    mutationFn: () => {
      if (!form.url.trim()) throw new Error('Source URL is required');
      return createGuidelineUpdate({
        ...form,
        published_date: form.published_date || undefined,
      });
    },
    onSuccess: async () => {
      setForm({ topic: '', organization: '', title: '', published_date: '', url: '', summary_by_admin: '' });
      await qc.invalidateQueries({ queryKey: ['guideline-updates'] });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveGuidelineUpdate(id),
    onSuccess: async () => {
      setApproveId(null);
      setApproveAck(false);
      await qc.invalidateQueries({ queryKey: ['guideline-updates'] });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const pending = (list.data || []).find((g) => g.id === approveId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Guideline updates</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Admin-entered only — no scraping. Preview always reminds clinicians to verify against the source.
        </p>
      </header>

      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}

      <form
        className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          createMut.mutate();
        }}
      >
        <h2 className="sm:col-span-2 font-medium">Add guideline update</h2>
        <div>
          <Label htmlFor="gu-topic">Topic</Label>
          <Input id="gu-topic" required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="gu-org">Organization</Label>
          <Input id="gu-org" required value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="gu-title">Title</Label>
          <Input id="gu-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="gu-date">Published date</Label>
          <Input id="gu-date" type="date" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="gu-url">Source URL (required)</Label>
          <Input id="gu-url" type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="gu-sum">Admin summary</Label>
          <textarea
            id="gu-sum"
            rows={3}
            value={form.summary_by_admin}
            onChange={(e) => setForm({ ...form, summary_by_admin: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2 rounded-md border border-dashed border-[var(--border)] p-3 text-sm">
          <p className="font-medium">Preview label</p>
          <p className="mt-1 text-[var(--muted)]">Verify against the source</p>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={createMut.isPending}>Create draft</Button>
        </div>
      </form>

      <div className="flex gap-1 border-b border-[var(--border)]" role="tablist">
        {(['all', 'draft', 'approved'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={cn(
              'px-3 py-2 text-sm capitalize',
              tab === t ? 'border-b-2 border-[var(--accent)] font-medium text-[var(--accent)]' : 'text-[var(--muted)]',
            )}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {(list.data || []).map((g) => (
          <article key={g.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-medium">{g.title}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {g.organization} · {g.topic}
                  {g.published_date ? ` · ${g.published_date}` : ''}
                </p>
              </div>
              <Badge tone={g.status === 'approved' ? 'ok' : 'warn'}>{g.status}</Badge>
            </div>
            {g.summary_by_admin && (
              <p className="mt-2 whitespace-pre-wrap text-sm">{g.summary_by_admin}</p>
            )}
            <p className="mt-2 text-xs font-medium text-[var(--warn)]">Verify against the source</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {g.url && (
                <a href={g.url} target="_blank" rel="noreferrer noopener" className="text-[var(--accent)] hover:underline">
                  Source URL
                </a>
              )}
              <span className="text-xs text-[var(--muted)]">{formatWhen(g.created_at)}</span>
              {g.status === 'draft' && (
                <Button type="button" variant="secondary" onClick={() => { setApproveAck(false); setApproveId(g.id); }}>
                  Approve
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>

      {approveId && pending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-5" role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold">Approve guideline update?</h2>
            <p className="mt-2 text-sm">{pending.title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{pending.organization} · {pending.url}</p>
            <p className="mt-2 text-sm text-[var(--warn)]">Verify against the source</p>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={approveAck} onChange={(e) => setApproveAck(e.target.checked)} />
              <span>I have reviewed this content and take responsibility for approving it.</span>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setApproveId(null)}>Cancel</Button>
              <Button
                type="button"
                disabled={!approveAck || approveMut.isPending}
                onClick={() => { setError(null); approveMut.mutate(approveId); }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
