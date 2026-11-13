import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  approveCheckRule,
  createCheckRule,
  draftCheckRuleWithAi,
  fetchCheckRule,
  fetchUsers,
  retireCheckRule,
  updateCheckRule,
} from '@/api/admin';
import { PROMPT_KINDS, type CheckRule } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APP_FRAME, wordingPreview } from '@/features/check-rules/matching';
import {
  parseCsvList,
  toApiBody,
  validateRuleDraft,
  type RuleDraft,
} from '@/features/check-rules/validation';
import { formatWhen } from '@/lib/format';

function draftFromRule(r: CheckRule): RuleDraft {
  return {
    name: r.name || '',
    problem_keywords: r.match?.problem_keywords || [],
    icd_prefixes: r.match?.icd_prefixes || [],
    prompts: (r.prompts || []).map((p) => ({ text: p.text, kind: p.kind })),
    compare_enabled: !!r.compare,
    fact_label_keywords: r.compare?.fact_label_keywords || [],
    lookback_days: r.compare?.lookback_days || 1,
  };
}

const emptyDraft = (): RuleDraft => ({
  name: '',
  problem_keywords: [],
  icd_prefixes: [],
  prompts: [{ text: '', kind: 'exam' }],
  compare_enabled: false,
  fact_label_keywords: [],
  lookback_days: 1,
});

export function CheckRuleEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const isAiDraft = id === 'ai-draft';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const existing = useQuery({
    queryKey: ['check-rule', id],
    queryFn: () => fetchCheckRule(id!),
    enabled: !!id && !isNew && !isAiDraft,
  });
  const users = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });

  const [draft, setDraft] = useState<RuleDraft>(emptyDraft);
  const [keywordsText, setKeywordsText] = useState('');
  const [icdText, setIcdText] = useState('');
  const [compareKwText, setCompareKwText] = useState('');
  const [rationale, setRationale] = useState('');
  const [aiCondition, setAiCondition] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveAck, setApproveAck] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);

  useEffect(() => {
    setHydrated(false);
  }, [id]);

  useEffect(() => {
    if (isNew || isAiDraft) {
      if (!hydrated) {
        setDraft(emptyDraft());
        setKeywordsText('');
        setIcdText('');
        setCompareKwText('');
        setRationale('');
        setHydrated(true);
      }
      return;
    }
    if (!existing.data || hydrated) return;
    const d = draftFromRule(existing.data);
    setDraft(d);
    setKeywordsText(d.problem_keywords.join(', '));
    setIcdText(d.icd_prefixes.join(', '));
    setCompareKwText(d.fact_label_keywords.join(', '));
    setHydrated(true);
  }, [existing.data, hydrated, isNew, isAiDraft]);

  const syncedDraft: RuleDraft = {
    ...draft,
    problem_keywords: parseCsvList(keywordsText),
    icd_prefixes: parseCsvList(icdText),
    fact_label_keywords: parseCsvList(compareKwText),
  };
  const issues = useMemo(() => validateRuleDraft(syncedDraft), [syncedDraft]);
  const preview = useMemo(() => wordingPreview(syncedDraft.prompts), [syncedDraft.prompts]);

  const emailById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users.data || []) m.set(u.id, u.email);
    return m;
  }, [users.data]);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['check-rules'] });
    if (id && !isNew && !isAiDraft) await qc.invalidateQueries({ queryKey: ['check-rule', id] });
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const body = toApiBody(syncedDraft);
      if (isNew || isAiDraft) return createCheckRule(body);
      return updateCheckRule(id!, body);
    },
    onSuccess: async (rule) => {
      await invalidate();
      navigate(`/reminders/${rule.id}`, { replace: true });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const aiMut = useMutation({
    mutationFn: () => draftCheckRuleWithAi(aiCondition.trim()),
    onSuccess: async (rule) => {
      await invalidate();
      navigate(`/reminders/${rule.id}`, { replace: true });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const approveMut = useMutation({
    mutationFn: () => approveCheckRule(id!),
    onSuccess: async () => {
      setApproveOpen(false);
      setApproveAck(false);
      await invalidate();
      await existing.refetch();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const retireMut = useMutation({
    mutationFn: () => retireCheckRule(id!),
    onSuccess: async () => {
      setRetireOpen(false);
      await invalidate();
      await existing.refetch();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const rule = existing.data;
  const readOnly = rule?.status === 'retired';

  function updatePrompt(i: number, patch: Partial<{ text: string; kind: string }>) {
    setDraft((d) => ({
      ...d,
      prompts: d.prompts.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm">
          <Link to="/reminders" className="text-[var(--accent)] hover:underline">Reminder rules</Link>
          <span className="text-[var(--muted)]"> / {isAiDraft ? 'AI draft' : isNew ? 'new' : 'edit'}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {isAiDraft ? 'Draft with AI' : isNew ? 'Create reminder rule' : rule?.name || 'Rule'}
          </h1>
          {rule && <Badge tone={rule.status === 'approved' ? 'ok' : rule.status === 'retired' ? 'danger' : 'warn'}>{rule.status}</Badge>}
          {rule?.ai_drafted && <Badge tone="warn">AI-drafted, needs physician review</Badge>}
        </div>
        {rule?.approved_by && (
          <p className="mt-1 text-sm text-[var(--muted)]">
            Approved by {emailById.get(rule.approved_by) || rule.approved_by} · {formatWhen(rule.approved_at)}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}

      {isAiDraft && (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="font-medium">AI draft helper</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Backend creates a <strong>draft only</strong> labeled AI-drafted. Never auto-approved. Invented citations are rejected server-side.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="min-w-[240px] flex-1">
              <Label htmlFor="ai-cond">Condition / topic</Label>
              <Input
                id="ai-cond"
                value={aiCondition}
                onChange={(e) => setAiCondition(e.target.value)}
                placeholder="e.g. pyelonephritis"
              />
            </div>
            <Button
              type="button"
              disabled={!aiCondition.trim() || aiMut.isPending}
              onClick={() => { setError(null); aiMut.mutate(); }}
            >
              {aiMut.isPending ? 'Drafting…' : 'Create AI draft'}
            </Button>
          </div>
        </section>
      )}

      {!isAiDraft && (
        <>
          {issues.length > 0 && (
            <ul className="rounded-md border border-[var(--warn)]/40 bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] px-3 py-2 text-sm text-[var(--warn)]">
              {issues.map((i) => <li key={`${i.path}-${i.message}`}>{i.message}</li>)}
            </ul>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  disabled={readOnly}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="rationale">Clinical rationale / source (guidance)</Label>
                <textarea
                  id="rationale"
                  disabled={readOnly}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
                  placeholder="e.g. bedside prompt per local protocol — not stored as a separate API field; keep citations in the name if needed."
                />
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Current backend does not persist a separate notes field. Prefer putting the citation in the rule name.
                </p>
              </div>

              <div>
                <Label htmlFor="kws">Problem keywords (comma-separated)</Label>
                <Input id="kws" disabled={readOnly} value={keywordsText} onChange={(e) => setKeywordsText(e.target.value)} placeholder="pyelonephritis, pyelo" />
              </div>
              <div>
                <Label htmlFor="icd">ICD prefixes (comma-separated)</Label>
                <Input id="icd" disabled={readOnly} value={icdText} onChange={(e) => setIcdText(e.target.value)} placeholder="N10" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-medium">Prompts</h2>
                  {!readOnly && (
                    <Button type="button" variant="secondary" onClick={() => setDraft({ ...draft, prompts: [...draft.prompts, { text: '', kind: 'review' }] })}>
                      Add prompt
                    </Button>
                  )}
                </div>
                <ul className="space-y-3">
                  {draft.prompts.map((p, i) => (
                    <li key={i} className="grid gap-2 rounded-md border border-[var(--border)] p-3 sm:grid-cols-[1fr_140px_auto]">
                      <Input
                        aria-label={`Prompt ${i + 1} text`}
                        disabled={readOnly}
                        value={p.text}
                        onChange={(e) => updatePrompt(i, { text: e.target.value })}
                        placeholder="Check CVA tenderness"
                      />
                      <select
                        aria-label={`Prompt ${i + 1} kind`}
                        disabled={readOnly}
                        className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-sm"
                        value={p.kind}
                        onChange={(e) => updatePrompt(i, { kind: e.target.value })}
                      >
                        {PROMPT_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                      {!readOnly && (
                        <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, prompts: draft.prompts.filter((_, idx) => idx !== i) })}>
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-[var(--border)] p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={draft.compare_enabled}
                    onChange={(e) => setDraft({ ...draft, compare_enabled: e.target.checked })}
                  />
                  Compare to yesterday
                </label>
                {draft.compare_enabled && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="cfk">Fact label keywords</Label>
                      <Input id="cfk" disabled={readOnly} value={compareKwText} onChange={(e) => setCompareKwText(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="lb">Lookback days (1–7)</Label>
                      <Input
                        id="lb"
                        type="number"
                        min={1}
                        max={7}
                        disabled={readOnly}
                        value={draft.lookback_days}
                        onChange={(e) => setDraft({ ...draft, lookback_days: Number(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={issues.length > 0 || saveMut.isPending}
                    onClick={() => { setError(null); saveMut.mutate(); }}
                  >
                    {isNew ? 'Create draft' : 'Save (stays/returns to draft)'}
                  </Button>
                  {rule?.status === 'draft' && (
                    <Button type="button" variant="secondary" onClick={() => { setApproveAck(false); setApproveOpen(true); }}>
                      Approve
                    </Button>
                  )}
                  {rule && rule.status !== 'retired' && (
                    <Button type="button" variant="danger" onClick={() => setRetireOpen(true)}>
                      Retire
                    </Button>
                  )}
                </div>
              )}
              {rule?.status === 'approved' && (
                <p className="text-xs text-[var(--muted)]">Saving an approved rule returns it to draft for re-approval.</p>
              )}
            </section>

            <aside className="space-y-4">
              <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="font-medium">App wording preview</h2>
                <p className="mt-1 text-xs text-[var(--muted)]">Shown to clinicians as plain text — never HTML.</p>
                <pre className="mt-3 whitespace-pre-wrap rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-sm">
                  {preview || APP_FRAME}
                </pre>
              </section>
            </aside>
          </div>
        </>
      )}

      {approveOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-lg border border-[var(--border)] bg-[var(--card)] p-5" role="dialog" aria-modal="true" aria-labelledby="approve-title">
            <h2 id="approve-title" className="text-lg font-semibold">Approve this rule?</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Exactly what will be served to clinicians:</p>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-xs">
              {preview}
            </pre>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Match: keywords {(syncedDraft.problem_keywords || []).join(', ') || '—'}; ICD {(syncedDraft.icd_prefixes || []).join(', ') || '—'}
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={approveAck} onChange={(e) => setApproveAck(e.target.checked)} className="mt-1" />
              <span>I have reviewed this content and take responsibility for approving it.</span>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setApproveOpen(false)}>Cancel</Button>
              <Button
                type="button"
                disabled={!approveAck || approveMut.isPending}
                onClick={() => { setError(null); approveMut.mutate(); }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmTypeDialog
        open={retireOpen}
        title="Retire this rule?"
        description="Retiring takes effect immediately in the app — matching patients will no longer see these prompts. Type RETIRE to confirm."
        confirmWord="RETIRE"
        confirmLabel="Retire"
        danger
        busy={retireMut.isPending}
        onClose={() => setRetireOpen(false)}
        onConfirm={async () => { await retireMut.mutateAsync(); }}
      />
    </div>
  );
}
