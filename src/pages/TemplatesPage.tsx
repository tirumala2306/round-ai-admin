import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTemplates } from '@/api/admin';
import { isActiveFlag, type TemplateVersion } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatWhen } from '@/lib/format';

type Group = {
  key: string;
  active: TemplateVersion | null;
  versions: TemplateVersion[];
};

export function TemplatesPage() {
  const navigate = useNavigate();
  const templates = useQuery({ queryKey: ['admin-templates'], queryFn: fetchTemplates });
  const [newKey, setNewKey] = useState('');

  const groups = useMemo(() => {
    const map = new Map<string, Group>();
    for (const row of templates.data || []) {
      const g = map.get(row.key) || { key: row.key, active: null, versions: [] };
      g.versions.push(row);
      if (isActiveFlag(row.active) && (!g.active || row.version > g.active.version)) {
        g.active = row;
      }
      map.set(row.key, g);
    }
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [templates.data]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Note templates</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Active versions plus history. Publishing always creates a new version — never edit in place.
          </p>
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const key = newKey.trim();
            if (!key) return;
            navigate(`/templates/${encodeURIComponent(key)}/edit`);
          }}
        >
          <div>
            <Label htmlFor="new-key">New template key</Label>
            <Input
              id="new-key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g. progress"
              pattern="[a-z_]+"
            />
          </div>
          <Button type="submit">Open editor</Button>
        </form>
      </header>

      {templates.isError && (
        <p className="text-sm text-[var(--danger)]" role="alert">{userFacingMessage(templates.error)}</p>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <article key={g.key} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-medium font-mono">{g.key}</h2>
                  {g.active ? (
                    <Badge tone="ok">Active v{g.active.version}</Badge>
                  ) : (
                    <Badge tone="warn">No active version</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {g.active?.title || g.versions[0]?.title || '—'}
                  {g.active ? ` · ${g.active.sections.length} sections` : ''}
                </p>
              </div>
              <Link
                to={`/templates/${encodeURIComponent(g.key)}/edit`}
                className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-fg)]"
              >
                Edit / publish new version
              </Link>
            </div>

            <h3 className="mt-5 text-xs uppercase tracking-wide text-[var(--muted)]">Version history</h3>
            <ul className="mt-2 divide-y divide-[var(--border)]">
              {g.versions
                .slice()
                .sort((a, b) => b.version - a.version)
                .map((v) => (
                  <li key={`${v.key}-${v.version}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <div>
                      <span className="font-medium">v{v.version}</span>
                      <span className="text-[var(--muted)]"> · {v.title} · {v.sections.length} sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActiveFlag(v.active) && <Badge tone="ok">Active</Badge>}
                      <span className="text-xs text-[var(--muted)]">{formatWhen(v.created_at)}</span>
                      <Link
                        to={`/templates/${encodeURIComponent(g.key)}/edit?from=${v.version}`}
                        className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
                      >
                        Use as base
                      </Link>
                    </div>
                  </li>
                ))}
            </ul>
          </article>
        ))}
        {!templates.isLoading && !groups.length && (
          <p className="text-sm text-[var(--muted)]">No templates yet. Create one with a new key above.</p>
        )}
      </div>
    </div>
  );
}
