import { useQuery } from '@tanstack/react-query';
import { fetchIcdStatus } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';

export function IcdPage() {
  const icd = useQuery({ queryKey: ['admin-icd'], queryFn: fetchIcdStatus });
  const d = icd.data;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">ICD-10-CM data</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Read-only status. Import is done on the server — there is no upload in this panel.
        </p>
      </header>

      {icd.isError && (
        <p className="text-sm text-[var(--danger)]" role="alert">{userFacingMessage(icd.error)}</p>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Status</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Code count</dt>
            <dd className="text-2xl font-semibold tabular-nums">{d?.count ?? '…'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Fiscal year</dt>
            <dd className="text-2xl font-semibold">{d?.fy || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">FTS enabled</dt>
            <dd className="mt-1">
              <Badge tone={d?.fts ? 'ok' : 'warn'}>{d?.fts ? 'Yes (FTS5)' : 'No (LIKE fallback)'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">Dataset</dt>
            <dd className="mt-1">
              <Badge tone={d?.demo_only ? 'warn' : 'ok'}>
                {d?.demo_only ? 'Demo subset only' : 'Official / non-demo loaded'}
              </Badge>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-[var(--muted)]">
          “Last import” is not stored as a separate timestamp by the API; replace the table via the CLI below when updating FY.
        </p>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="font-medium">Import instructions</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
          <li>
            Download <strong>Code Descriptions in Tabular Order</strong> for the current FY from CDC or CMS.
          </li>
          <li>
            On the backend host, run:
            <pre className="mt-2 overflow-x-auto rounded-md bg-[color-mix(in_oklab,var(--fg)_4%,transparent)] p-3 text-xs">
{`npm run import-icd -- path/to/icd10cm-order-YYYY.txt --fy=YYYY --replace`}
            </pre>
            <p className="mt-2 text-[var(--muted)]">
              Backend reports: <code className="font-mono text-xs">{d?.import || 'npm run import-icd -- <file> --fy=YYYY --replace'}</code>
            </p>
          </li>
          <li>Confirm here via Refresh / reload — count and FY should update.</li>
        </ol>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              className="text-[var(--accent)] hover:underline"
              href={d?.links?.cdc || 'https://www.cdc.gov/nchs/icd/icd-10-cm/files.html'}
              target="_blank"
              rel="noreferrer noopener"
            >
              CDC ICD-10-CM files
            </a>
          </li>
          <li>
            <a
              className="text-[var(--accent)] hover:underline"
              href={d?.links?.cms || 'https://www.cms.gov/medicare/coding-billing/icd-10-codes'}
              target="_blank"
              rel="noreferrer noopener"
            >
              CMS ICD-10 codes
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
