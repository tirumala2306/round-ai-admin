import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { fetchAudit, fetchAuditCsv, fetchUsers } from '@/api/admin';
import { CHAT_AUDIT_ACTIONS, type AuditRow } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { downloadTextFile, formatWhen } from '@/lib/format';

const OTHER_AUDIT_ACTIONS = [
  { value: 'login', label: 'login' },
  { value: 'admin_ai_switch', label: 'admin_ai_switch' },
] as const;

const PAGE = 50;

export function AuditPage() {
  const [actorId, setActorId] = useState('');
  const [action, setAction] = useState('');
  const [patientId, setPatientId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const filters = useMemo(
    () => ({
      actor_id: actorId || undefined,
      action: action || undefined,
      patient_id: patientId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit: PAGE,
      offset,
    }),
    [actorId, action, patientId, from, to, offset],
  );

  const users = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });
  const audit = useQuery({ queryKey: ['admin-audit', filters], queryFn: () => fetchAudit(filters) });

  const emailById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of users.data || []) m.set(u.id, u.email);
    return m;
  }, [users.data]);

  async function onExport() {
    setExportError(null);
    setExporting(true);
    try {
      const csv = await fetchAuditCsv({
        actor_id: filters.actor_id,
        action: filters.action,
        patient_id: filters.patient_id,
        from: filters.from,
        to: filters.to,
        limit: 5000,
      });
      downloadTextFile(`roundsai-audit-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch (e) {
      setExportError(userFacingMessage(e));
    } finally {
      setExporting(false);
    }
  }

  const total = audit.data?.total ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Filterable history of admin and clinical workflow actions.</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void onExport()} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </header>

      <p className="rounded-md border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent)_8%,var(--card))] px-3 py-2 text-sm" role="note">
        Audit rows never contain clinical text.
      </p>

      {exportError && <p className="text-sm text-[var(--danger)]" role="alert">{exportError}</p>}
      {audit.isError && <p className="text-sm text-[var(--danger)]" role="alert">{userFacingMessage(audit.error)}</p>}

      <form
        className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(e) => {
          e.preventDefault();
          setOffset(0);
        }}
      >
        <div>
          <Label htmlFor="actor">Actor</Label>
          <select
            id="actor"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            value={actorId}
            onChange={(e) => { setActorId(e.target.value); setOffset(0); }}
          >
            <option value="">Any</option>
            {(users.data || []).map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="action">Action</Label>
          <select
            id="action"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
            value={action}
            onChange={(e) => { setAction(e.target.value); setOffset(0); }}
            data-testid="audit-action-filter"
          >
            <option value="">Any</option>
            <optgroup label="Chat">
              {CHAT_AUDIT_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </optgroup>
            <optgroup label="Other">
              {OTHER_AUDIT_ACTIONS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <Label htmlFor="patient">Patient ID</Label>
          <Input id="patient" value={patientId} onChange={(e) => { setPatientId(e.target.value); setOffset(0); }} />
        </div>
        <div>
          <Label htmlFor="from">From (ISO)</Label>
          <Input id="from" value={from} onChange={(e) => { setFrom(e.target.value); setOffset(0); }} placeholder="2026-01-01" />
        </div>
        <div>
          <Label htmlFor="to">To (ISO)</Label>
          <Input id="to" value={to} onChange={(e) => { setTo(e.target.value); setOffset(0); }} placeholder="2026-12-31T23:59:59Z" />
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Patient ID</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {(audit.data?.rows || []).map((row) => (
              <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">{formatWhen(row.at)}</td>
                <td className="px-4 py-3">
                  {row.actor_id ? (
                    <Link
                      className="text-[var(--accent)] underline-offset-2 hover:underline"
                      to={`/users?highlight=${encodeURIComponent(row.actor_id)}`}
                    >
                      {emailById.get(row.actor_id) || row.actor_id}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.patient_id || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" variant="ghost" onClick={() => setSelected(row)}>
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
            {!audit.isLoading && !(audit.data?.rows.length) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">No rows</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-[var(--muted)]">
          {total} total · showing {offset + 1}–{Math.min(offset + PAGE, total)}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" disabled={offset <= 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>
            Previous
          </Button>
          <Button type="button" variant="secondary" disabled={offset + PAGE >= total} onClick={() => setOffset(offset + PAGE)}>
            Next
          </Button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="presentation" onClick={() => setSelected(null)}>
          <aside
            className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--border)] bg-[var(--card)] p-5"
            role="dialog"
            aria-label="Audit detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">Audit detail</h2>
              <Button type="button" variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">IDs and codes only — never clinical text.</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--muted)]">ID</dt>
                <dd className="font-mono">{selected.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">When</dt>
                <dd>{formatWhen(selected.at)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Actor</dt>
                <dd className="font-mono text-xs break-all">
                  {selected.actor_id ? (
                    <Link
                      className="text-[var(--accent)] underline-offset-2 hover:underline"
                      to={`/users?highlight=${encodeURIComponent(selected.actor_id)}`}
                    >
                      {emailById.get(selected.actor_id) || selected.actor_id}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Action</dt>
                <dd className="font-mono">{selected.action}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Patient ID</dt>
                <dd className="font-mono text-xs break-all">{selected.patient_id || '—'}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Artifact ID</dt>
                <dd className="font-mono text-xs break-all">{selected.artifact_id || '—'}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Detail</dt>
                <dd>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-xs">
                    {selected.detail == null ? '—' : JSON.stringify(selected.detail, null, 2)}
                  </pre>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}
