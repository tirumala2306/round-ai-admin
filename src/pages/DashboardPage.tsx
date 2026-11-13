import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  fetchCuratedReads,
  fetchDraftRules,
  fetchGuidelineUpdates,
  fetchHealth,
  fetchReportedMcqs,
  fetchSettings,
  fetchUnreviewedMcqs,
  fetchUsage,
  updateSettings,
} from '@/api/admin';
import { isActiveFlag } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { ChatDashboardCard } from '@/features/chat/ChatDashboardCard';
import { monthStartIso, sumUsage, todayIso } from '@/lib/format';

export function DashboardPage() {
  const qc = useQueryClient();
  const [killOpen, setKillOpen] = useState(false);

  const health = useQuery({ queryKey: ['admin-health'], queryFn: fetchHealth });
  const settings = useQuery({ queryKey: ['admin-settings'], queryFn: fetchSettings });
  const usage = useQuery({ queryKey: ['admin-usage', monthStartIso()], queryFn: () => fetchUsage(monthStartIso()) });
  const drafts = useQuery({ queryKey: ['draft-rules'], queryFn: fetchDraftRules });
  const unreviewed = useQuery({ queryKey: ['mcq-unreviewed'], queryFn: fetchUnreviewedMcqs });
  const reported = useQuery({ queryKey: ['mcq-reported'], queryFn: fetchReportedMcqs });
  const curated = useQuery({ queryKey: ['curated-reads'], queryFn: () => fetchCuratedReads() });
  const guidelines = useQuery({ queryKey: ['guideline-updates'], queryFn: () => fetchGuidelineUpdates() });

  const aiEnabled = settings.data?.ai_enabled ?? health.data?.ai_enabled ?? true;

  const today = todayIso();
  const usageToday = useMemo(() => sumUsage(usage.data || [], today), [usage.data, today]);
  const usageMonth = useMemo(() => sumUsage(usage.data || [], null), [usage.data]);

  const unapprovedReads = (curated.data || []).filter((r) => !isActiveFlag(r.approved)).length;
  const draftGuidelines = (guidelines.data || []).filter((g) => g.status === 'draft').length;

  const toggleAi = useMutation({
    mutationFn: (enabled: boolean) => updateSettings({ ai_enabled: enabled }),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['admin-settings'] }),
        qc.invalidateQueries({ queryKey: ['admin-health'] }),
      ]);
      setKillOpen(false);
    },
  });

  const counts = [
    { label: 'Draft reminder rules', value: drafts.data?.length },
    { label: 'Unreviewed questions', value: unreviewed.data?.length },
    { label: 'Reported questions', value: reported.data?.length },
    { label: 'Unapproved curated reads', value: unapprovedReads },
    { label: 'Draft guideline updates', value: draftGuidelines },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          AI controls, usage, and content waiting for review. No patient clinical content is shown.
        </p>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">AI status</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Provider / model / prompt are read-only. Kill switch is audited.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Provider</dt>
                <dd>{settings.data?.provider || health.data?.provider || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Model</dt>
                <dd>{settings.data?.model || health.data?.model || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Prompt version</dt>
                <dd>{settings.data?.prompt_version || health.data?.prompt_version || '—'}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={aiEnabled ? 'ok' : 'danger'}>{aiEnabled ? 'AI enabled' : 'AI disabled'}</Badge>
            <Button
              type="button"
              variant={aiEnabled ? 'danger' : 'primary'}
              onClick={() => setKillOpen(true)}
            >
              {aiEnabled ? 'Disable AI' : 'Enable AI'}
            </Button>
          </div>
        </div>
        {toggleAi.isError && (
          <p className="mt-3 text-sm text-[var(--danger)]" role="alert">
            {userFacingMessage(toggleAi.error)}
          </p>
        )}
      </section>

      <ChatDashboardCard settings={settings.data} loading={settings.isLoading} />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="font-medium">Usage today</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{usageToday.calls}</p>
          <p className="text-sm text-[var(--muted)]">{usageToday.tokens.toLocaleString()} tokens</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="font-medium">Usage this month</h2>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{usageMonth.calls}</p>
          <p className="text-sm text-[var(--muted)]">{usageMonth.tokens.toLocaleString()} tokens</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">Needs action</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {counts.map((c) => (
            <li key={c.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-sm text-[var(--muted)]">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {c.value === undefined ? '…' : c.value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-medium">System health</h2>
        {health.isError && (
          <p className="mt-2 text-sm text-[var(--danger)]">{userFacingMessage(health.error)}</p>
        )}
        {health.data && (
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Status</dt>
              <dd>{health.data.status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Database</dt>
              <dd>{health.data.db_ok ? 'ok' : 'down'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">ICD</dt>
              <dd>{health.data.icd_loaded ? 'loaded' : 'empty'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Checked</dt>
              <dd className="text-sm">{new Date(health.data.time).toLocaleString()}</dd>
            </div>
          </dl>
        )}
      </section>

      <ConfirmTypeDialog
        open={killOpen}
        title={aiEnabled ? 'Disable AI for all users?' : 'Re-enable AI?'}
        description={
          aiEnabled
            ? 'This immediately stops AI generation across the app. Type DISABLE to confirm.'
            : 'Type ENABLE to turn AI back on.'
        }
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
