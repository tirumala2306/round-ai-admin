import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchMcqDetail, fetchMcqReports, patchMcqStatus } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { asText, optionLetters, pubmedUrl } from '@/features/teaching/pubmed';
import { formatWhen } from '@/lib/format';

export function QuestionDetailPage() {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const detail = useQuery({ queryKey: ['mcq-detail', id], queryFn: () => fetchMcqDetail(id), enabled: !!id });
  const reports = useQuery({ queryKey: ['mcq-reports'], queryFn: fetchMcqReports });
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveAck, setApproveAck] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = (detail.data?.content || {}) as Record<string, unknown>;
  const options = optionLetters(content.options);
  const optionExplanations = (content.option_explanations || {}) as Record<string, unknown>;
  const refs = Array.isArray(content.references) ? content.references : [];
  const packet = Array.isArray(content.evidence_packet)
    ? content.evidence_packet
    : Array.isArray(content.packet)
      ? content.packet
      : [];

  const relatedReports = useMemo(
    () => (reports.data || []).filter((r) => r.mcq_id === id),
    [reports.data, id],
  );

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['mcq-detail', id] }),
      qc.invalidateQueries({ queryKey: ['mcq-queue'] }),
      qc.invalidateQueries({ queryKey: ['mcq-reports'] }),
      qc.invalidateQueries({ queryKey: ['mcq-unreviewed'] }),
      qc.invalidateQueries({ queryKey: ['mcq-reported'] }),
    ]);
  };

  const statusMut = useMutation({
    mutationFn: (status: 'approved' | 'retired' | 'ai_generated_unreviewed') => patchMcqStatus(id, status),
    onSuccess: async () => {
      setApproveOpen(false);
      setRetireOpen(false);
      setApproveAck(false);
      await invalidate();
      await detail.refetch();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const m = detail.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm">
          <Link to="/questions" className="text-[var(--accent)] hover:underline">Question bank</Link>
          <span className="text-[var(--muted)]"> / detail</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{m?.topic || 'Question'}</h1>
          {m && <Badge tone={m.status === 'approved' ? 'ok' : m.status === 'reported' ? 'danger' : 'warn'}>{m.status}</Badge>}
          {m?.source === 'ai_generated' && <Badge tone="warn">AI-drafted</Badge>}
        </div>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {m?.difficulty || '—'} · {m?.stage || '—'} · created {formatWhen(m?.created_at)}
          {m?.approved_by ? ` · approved ${formatWhen(m.approved_at)}` : ''}
        </p>
      </div>

      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}
      {detail.isError && <p className="text-sm text-[var(--danger)]" role="alert">{userFacingMessage(detail.error)}</p>}

      {m && (
        <>
          <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Vignette</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm">{asText(content.vignette) || '—'}</p>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Question</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium">{asText(content.question) || '—'}</p>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Options</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {options.map((o) => (
                  <li key={o.letter} className="rounded-md border border-[var(--border)] px-3 py-2">
                    <span className="font-mono font-medium">{o.letter}.</span> {o.text || '—'}
                    {asText(content.answer) === o.letter && (
                      <Badge tone="ok" className="ml-2">Answer key</Badge>
                    )}
                    {asText(optionExplanations[o.letter]) && (
                      <p className="mt-1 text-xs text-[var(--muted)] whitespace-pre-wrap">
                        {asText(optionExplanations[o.letter])}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Explanation</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm">{asText(content.explanation) || '—'}</p>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Learning objective</h2>
              <p className="mt-1 whitespace-pre-wrap text-sm">{asText(content.learning_objective) || '—'}</p>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">References (PMID)</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {refs.length === 0 && <li className="text-[var(--muted)]">—</li>}
                {refs.map((r, i) => {
                  const pmid = typeof r === 'object' && r && 'pmid' in r ? String((r as { pmid: unknown }).pmid) : asText(r);
                  const href = pubmedUrl(pmid);
                  return (
                    <li key={`${pmid}-${i}`}>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer noopener" className="text-[var(--accent)] hover:underline">
                          PMID {pmid}
                        </a>
                      ) : (
                        pmid || '—'
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Validation result</h2>
              <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-xs whitespace-pre-wrap">
                {m.validation == null ? '—' : asText(m.validation)}
              </pre>
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wide text-[var(--muted)]">Evidence packet (titles / dates)</h2>
              <ul className="mt-2 space-y-2 text-sm">
                {packet.length === 0 && (
                  <li className="text-[var(--muted)]">Not stored on this MCQ (references above may still list PMIDs).</li>
                )}
                {packet.map((p, i) => {
                  const item = (p && typeof p === 'object' ? p : {}) as Record<string, unknown>;
                  return (
                    <li key={i} className="rounded-md border border-[var(--border)] px-3 py-2">
                      <div>{asText(item.title) || 'Untitled'}</div>
                      <div className="text-xs text-[var(--muted)]">{asText(item.date) || asText(item.published) || '—'}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {relatedReports.length > 0 && (
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="font-medium">Reports on this question</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {relatedReports.map((r) => (
                  <li key={r.id} className="whitespace-pre-wrap text-[var(--muted)]">
                    {r.note || '(no note)'} · {formatWhen(r.created_at)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap gap-2">
            {m.status !== 'approved' && (
              <Button type="button" onClick={() => { setApproveAck(false); setApproveOpen(true); }}>
                Approve
              </Button>
            )}
            {m.status !== 'ai_generated_unreviewed' && (
              <Button
                type="button"
                variant="secondary"
                disabled={statusMut.isPending}
                onClick={() => { setError(null); statusMut.mutate('ai_generated_unreviewed'); }}
              >
                Return to unreviewed
              </Button>
            )}
            {m.status !== 'retired' && (
              <Button type="button" variant="danger" onClick={() => setRetireOpen(true)}>
                Retire
              </Button>
            )}
          </div>
          <p className="text-xs text-[var(--muted)]">
            Stem/option text editing is disabled — backend has no versioned MCQ edit endpoint.
          </p>
        </>
      )}

      {approveOpen && m && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--card)] p-5" role="dialog" aria-modal="true">
            <h2 className="text-lg font-semibold">Approve this question?</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">This will be served from the approved teaching bank.</p>
            <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-xs">
              {asText(content.question)}
              {'\n\n'}
              Answer: {asText(content.answer)}
            </pre>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={approveAck} onChange={(e) => setApproveAck(e.target.checked)} />
              <span>I have reviewed this content and take responsibility for approving it.</span>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setApproveOpen(false)}>Cancel</Button>
              <Button
                type="button"
                disabled={!approveAck || statusMut.isPending}
                onClick={() => { setError(null); statusMut.mutate('approved'); }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmTypeDialog
        open={retireOpen}
        title="Retire this question?"
        description="Retiring takes effect immediately — it will leave the learner bank. Type RETIRE to confirm."
        confirmWord="RETIRE"
        confirmLabel="Retire"
        danger
        busy={statusMut.isPending}
        onClose={() => setRetireOpen(false)}
        onConfirm={async () => { await statusMut.mutateAsync('retired'); }}
      />
    </div>
  );
}
