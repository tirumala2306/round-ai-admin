import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchTemplates, publishTemplate } from '@/api/admin';
import { isActiveFlag, type TemplateSection } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SOURCE_HELP, TEMPLATE_SOURCES } from '@/features/templates/sources';
import {
  moveSection,
  noteSkeletonPreview,
  validateTemplateDraft,
} from '@/features/templates/validation';

function emptySection(): TemplateSection {
  return { key: '', title: '', source: 'clinician_subjective' };
}

export function TemplateEditorPage() {
  const { key: routeKey = '' } = useParams();
  const [search] = useSearchParams();
  const fromVersion = Number(search.get('from') || '') || null;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const templates = useQuery({ queryKey: ['admin-templates'], queryFn: fetchTemplates });
  const [key, setKey] = useState(routeKey);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<TemplateSection[]>([emptySection()]);
  const [publishOpen, setPublishOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setKey(routeKey);
    setHydrated(false);
  }, [routeKey]);

  useEffect(() => {
    if (!templates.data || hydrated) return;
    const versions = templates.data.filter((t) => t.key === routeKey);
    const base =
      (fromVersion ? versions.find((v) => v.version === fromVersion) : null)
      || versions.find((v) => isActiveFlag(v.active))
      || versions[0];
    if (base) {
      setTitle(base.title);
      setSections(base.sections.map((s) => ({ ...s })));
    } else {
      setTitle(routeKey.replace(/_/g, ' '));
      setSections([emptySection()]);
    }
    setHydrated(true);
  }, [templates.data, routeKey, fromVersion, hydrated]);

  const issues = useMemo(() => validateTemplateDraft({ key, title, sections }), [key, title, sections]);
  const preview = useMemo(() => noteSkeletonPreview(title, sections), [title, sections]);

  const publishMut = useMutation({
    mutationFn: () =>
      publishTemplate(key.trim(), {
        title: title.trim(),
        sections: sections.map((s) => ({
          key: s.key.trim(),
          title: s.title.trim(),
          source: s.source,
        })),
      }),
    onSuccess: async (res) => {
      setPublishOpen(false);
      await qc.invalidateQueries({ queryKey: ['admin-templates'] });
      navigate('/templates', { replace: true, state: { published: res } });
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  function updateSection(i: number, patch: Partial<TemplateSection>) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm">
            <Link to="/templates" className="text-[var(--accent)] hover:underline">Note templates</Link>
            <span className="text-[var(--muted)]"> / editor</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Publish new version</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Changes here are local until you publish. Publishing creates a new version and makes it active.
          </p>
        </div>
        <Button
          type="button"
          disabled={issues.length > 0}
          onClick={() => { setError(null); setPublishOpen(true); }}
        >
          Publish new version
        </Button>
      </div>

      {error && <p className="text-sm text-[var(--danger)]" role="alert">{error}</p>}
      {issues.length > 0 && (
        <ul className="rounded-md border border-[var(--warn)]/40 bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] px-3 py-2 text-sm text-[var(--warn)]" role="status">
          {issues.map((iss) => (
            <li key={`${iss.path}-${iss.message}`}>{iss.message}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="tpl-key">Template key</Label>
              <Input
                id="tpl-key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={Boolean(routeKey)}
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="tpl-title">Title</Label>
              <Input id="tpl-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <h2 className="font-medium">Sections</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSections((s) => [...s, emptySection()])}
            >
              Add section
            </Button>
          </div>

          <ol className="space-y-4">
            {sections.map((s, i) => (
              <li key={i} className="rounded-md border border-[var(--border)] p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wide text-[var(--muted)]">Section {i + 1}</span>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" aria-label={`Move section ${i + 1} up`} disabled={i === 0} onClick={() => setSections((prev) => moveSection(prev, i, -1))}>
                      ↑
                    </Button>
                    <Button type="button" variant="ghost" aria-label={`Move section ${i + 1} down`} disabled={i === sections.length - 1} onClick={() => setSections((prev) => moveSection(prev, i, 1))}>
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      aria-label={`Remove section ${i + 1}`}
                      onClick={() => setSections((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label htmlFor={`sk-${i}`}>Key</Label>
                    <Input id={`sk-${i}`} className="font-mono" value={s.key} onChange={(e) => updateSection(i, { key: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor={`st-${i}`}>Title</Label>
                    <Input id={`st-${i}`} value={s.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor={`ss-${i}`}>Source</Label>
                    <select
                      id={`ss-${i}`}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                      value={s.source}
                      onChange={(e) => updateSection(i, { source: e.target.value })}
                    >
                      {TEMPLATE_SOURCES.map((src) => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {SOURCE_HELP[s.source as keyof typeof SOURCE_HELP] || 'Choose an allowed source.'}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="font-medium">Note skeleton preview</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">How section order appears in the app. Shown as plain text only.</p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-xs whitespace-pre-wrap">
              {preview}
            </pre>
          </section>
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="font-medium">Source meanings</h2>
            <ul className="mt-3 space-y-3 text-xs text-[var(--muted)]">
              {TEMPLATE_SOURCES.map((src) => (
                <li key={src}>
                  <span className="font-mono text-[var(--fg)]">{src}</span>
                  <p className="mt-0.5">{SOURCE_HELP[src]}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <ConfirmTypeDialog
        open={publishOpen}
        title="Publish new template version?"
        description={
          <>
            This creates <strong>version {(templates.data?.filter((t) => t.key === key).reduce((m, t) => Math.max(m, t.version), 0) || 0) + 1}</strong> for{' '}
            <span className="font-mono">{key}</span> and makes it active immediately. Prior versions stay in history. Type <strong>PUBLISH</strong> to confirm.
          </>
        }
        confirmWord="PUBLISH"
        confirmLabel="Publish"
        busy={publishMut.isPending}
        onClose={() => setPublishOpen(false)}
        onConfirm={async () => {
          if (issues.length) return;
          await publishMut.mutateAsync();
        }}
      />
    </div>
  );
}
