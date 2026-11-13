import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { approveCuratedRead, createCuratedRead, fetchCuratedReads } from '@/api/admin';
import { isActiveFlag } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pubmedUrl } from '@/features/teaching/pubmed';
import { formatWhen } from '@/lib/format';

export function CuratedReadsPage() {
  const qc = useQueryClient();
  const reads = useQuery({ queryKey: ['curated-reads'], queryFn: () => fetchCuratedReads() });
  const [form, setForm] = useState({
    topic: '',
    title: '',
    citation: '',
    pmid: '',
    url: '',
    why_it_matters: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [approveAck, setApproveAck] = useState(false);

  const createMut = useMutation({
    mutationFn: () => createCuratedRead(form),
    onSuccess: async () => {
      setForm({ topic: '', title: '', citation: '', pmid: '', url: '', why_it_matters: '' });
      await qc.invalidateQueries({ queryKey: ['curated-reads'] });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveCuratedRead(id),
    onSuccess: async () => {
      setApproveId(null);
      setApproveAck(false);
      await qc.invalidateQueries({ queryKey: ['curated-reads'] });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const pending = (reads.data || []).find((r) => r.id === approveId);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Curated reads (high-yield)</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Only <strong>approved</strong> items are labeled high-yield in the app. No scraping — enter PMIDs/URLs manually.
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
        <h2 className="sm:col-span-2 font-medium">Add curated read</h2>
        <div>
          <Label htmlFor="cr-topic">Topic</Label>
          <Input id="cr-topic" required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="cr-title">Title</Label>
          <Input id="cr-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="cr-cit">Citation</Label>
          <Input id="cr-cit" value={form.citation} onChange={(e) => setForm({ ...form, citation: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="cr-pmid">PMID</Label>
          <Input id="cr-pmid" value={form.pmid} onChange={(e) => setForm({ ...form, pmid: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cr-url">URL</Label>
          <Input id="cr-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cr-why">Why it matters</Label>
          <textarea
            id="cr-why"
            rows={3}
            value={form.why_it_matters}
            onChange={(e) => setForm({ ...form, why_it_matters: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={createMut.isPending}>Create (unapproved)</Button>
        </div>
      </form>

      <div className="space-y-3">
        {(reads.data || []).map((r) => {
          const href = r.url || pubmedUrl(r.pmid);
          return (
            <article key={r.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{r.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{r.topic} · {r.citation || '—'}</p>
                </div>
                <Badge tone={isActiveFlag(r.approved) ? 'ok' : 'warn'}>
                  {isActiveFlag(r.approved) ? 'Approved' : 'Draft'}
                </Badge>
              </div>
              {r.why_it_matters && (
                <p className="mt-2 whitespace-pre-wrap text-sm">{r.why_it_matters}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {href && (
                  <a href={href} target="_blank" rel="noreferrer noopener" className="text-[var(--accent)] hover:underline">
                    {r.pmid ? `PMID ${r.pmid}` : 'Open URL'}
                  </a>
                )}
                <span className="text-xs text-[var(--muted)]">{formatWhen(r.created_at)}</span>
                {!isActiveFlag(r.approved) && (
                  <Button type="button" variant="secondary" onClick={() => { setApproveAck(false); setApproveId(r.id); }}>
                    Approve
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {approveId && pending && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-5" role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold">Approve as high-yield?</h2>
            <p className="mt-2 text-sm whitespace-pre-wrap">{pending.title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{pending.citation || pending.pmid || pending.url}</p>
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
