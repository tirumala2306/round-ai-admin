import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchSettings, updateSettings } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatRoleMatrix } from '@/features/chat/ChatRoleMatrix';
import { ChatSettingsPanel } from '@/features/chat/ChatSettingsPanel';

export function SettingsPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings });
  const [intervalsText, setIntervalsText] = useState('1, 3, 7');
  const [killOpen, setKillOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.data?.review_intervals_days) {
      setIntervalsText(settings.data.review_intervals_days.join(', '));
    }
  }, [settings.data]);

  const saveIntervals = useMutation({
    mutationFn: async () => {
      const parts = intervalsText.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
      const days = parts.map((p) => Number(p));
      if (!days.length || days.some((n) => !Number.isInteger(n) || n <= 0 || n >= 400)) {
        throw new Error('Enter positive integers under 400, separated by commas (e.g. 1, 3, 7)');
      }
      return updateSettings({ review_intervals_days: days });
    },
    onSuccess: async () => {
      setMessage('Review intervals saved.');
      setError(null);
      await qc.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (e) => {
      setMessage(null);
      setError(userFacingMessage(e));
    },
  });

  const toggleAi = useMutation({
    mutationFn: (enabled: boolean) => updateSettings({ ai_enabled: enabled }),
    onSuccess: async () => {
      setKillOpen(false);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-settings'] }),
        qc.invalidateQueries({ queryKey: ['admin-health'] }),
      ]);
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const learnerMut = useMutation({
    mutationFn: (enabled: boolean) => updateSettings({ show_individual_learner_analytics: enabled }),
    onSuccess: async () => {
      setMessage('Learner analytics setting saved.');
      setError(null);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-settings'] }),
        qc.invalidateQueries({ queryKey: ['admin-question-analytics'] }),
      ]);
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const s = settings.data;
  const aiEnabled = s?.ai_enabled ?? true;
  const learnerOn = !!s?.show_individual_learner_analytics;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Spaced-review intervals, AI kill switch, and chat governance. Feature flags and AI limits are read-only here.
        </p>
      </header>

      {message && <p className="text-sm text-[var(--accent)]" role="status">{message}</p>}
      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">AI switch</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge tone={aiEnabled ? 'ok' : 'danger'}>{aiEnabled ? 'Enabled' : 'Disabled'}</Badge>
          <span className="text-sm text-[var(--muted)]">
            {s?.provider} / {s?.model || '—'} · prompt {s?.prompt_version}
          </span>
          <Button type="button" variant={aiEnabled ? 'danger' : 'primary'} onClick={() => setKillOpen(true)}>
            {aiEnabled ? 'Disable AI' : 'Enable AI'}
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Review intervals (days)</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Spaced review schedule for teaching questions.</p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Label htmlFor="intervals">Days</Label>
            <Input
              id="intervals"
              value={intervalsText}
              onChange={(e) => setIntervalsText(e.target.value)}
              placeholder="1, 3, 7"
            />
          </div>
          <Button type="button" onClick={() => saveIntervals.mutate()} disabled={saveIntervals.isPending}>
            Save
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Feature flags</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Read-only (set via backend env).</p>
        <ul className="mt-3 space-y-1 text-sm">
          {s?.features
            ? Object.entries(s.features).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
                  <span>{k}</span>
                  <span className="text-[var(--muted)]">{String(v)}</span>
                </li>
              ))
            : <li className="text-[var(--muted)]">Loading…</li>}
        </ul>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Limits</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Read-only.</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-[var(--muted)]">Max AI calls / user / day</dt>
            <dd className="text-lg font-medium">{s?.limits.max_calls_per_user_per_day ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Max context facts</dt>
            <dd className="text-lg font-medium">{s?.limits.max_context_facts ?? '—'}</dd>
          </div>
        </dl>
        {s?.cors_origin && (
          <p className="mt-4 text-xs text-[var(--muted)]">CORS origin: {s.cors_origin}</p>
        )}
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Individual learner analytics</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Defaults <strong>off</strong>. Enabling shows per-user question performance on the analytics page (privacy / HR sensitive). Confirm policy before turning on.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm">{learnerOn ? 'Currently on' : 'Currently off'}</span>
          <Button
            type="button"
            variant="secondary"
            disabled={learnerMut.isPending}
            onClick={() => learnerMut.mutate(!learnerOn)}
          >
            {learnerOn ? 'Turn off' : 'Turn on'}
          </Button>
        </div>
      </section>

      <ChatSettingsPanel settings={s} />

      <ChatRoleMatrix />

      <ConfirmTypeDialog
        open={killOpen}
        title={aiEnabled ? 'Disable AI?' : 'Enable AI?'}
        description={aiEnabled ? 'Type DISABLE to confirm the kill switch.' : 'Type ENABLE to turn AI back on.'}
        confirmWord={aiEnabled ? 'DISABLE' : 'ENABLE'}
        confirmLabel={aiEnabled ? 'Disable AI' : 'Enable AI'}
        danger={aiEnabled}
        busy={toggleAi.isPending}
        onClose={() => setKillOpen(false)}
        onConfirm={async () => { await toggleAi.mutateAsync(!aiEnabled); }}
      />
    </div>
  );
}
