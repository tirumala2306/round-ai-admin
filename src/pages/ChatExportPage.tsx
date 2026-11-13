import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { fetchExportHistory, fetchTeams } from '@/api/admin';
import { userFacingMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { canPerformChatAction } from '@/features/chat/capabilities';
import { downloadChatExport } from '@/features/chat/exportDownload';
import { formatWhen } from '@/lib/format';

export function ChatExportPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const allowed = canPerformChatAction(user?.role, 'request_export');

  const teams = useQuery({ queryKey: ['admin-teams'], queryFn: fetchTeams, enabled: allowed });
  const history = useQuery({
    queryKey: ['chat-export-history'],
    queryFn: () => fetchExportHistory({ limit: 50 }),
    enabled: allowed,
  });

  const [teamId, setTeamId] = useState('');
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!teamId && teams.data?.[0]?.id) setTeamId(teams.data[0].id);
  }, [teams.data, teamId]);

  const reasonOk = reason.trim().length >= 3;
  const teamOk = !!teamId;

  const exportMut = useMutation({
    mutationFn: async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      return downloadChatExport({
        teamId,
        reason: reason.trim(),
        signal: controller.signal,
      });
    },
    onSuccess: async (result) => {
      setConfirmOpen(false);
      setError(null);
      setStatus(
        `Export file saved as ${result.filename} (${result.bytes} bytes). Content was not opened in this panel. Audit + history updated by the backend.`,
      );
      setReason('');
      await qc.invalidateQueries({ queryKey: ['chat-export-history'] });
      await qc.invalidateQueries({ queryKey: ['admin-audit'] });
    },
    onError: (e) => {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setError('Export cancelled (signed out or left the page).');
        return;
      }
      setError(userFacingMessage(e));
    },
    onSettled: () => {
      abortRef.current = null;
    },
  });

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Compliance chat export</h1>
        <p className="text-sm text-[var(--danger)]" role="alert">
          Not allowed for your role. Chat export requires admin (backend-enforced).
        </p>
        <Link to="/settings#chat" className="text-sm text-[var(--accent)] underline-offset-2 hover:underline">
          ← Chat settings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm text-[var(--muted)]">
          <Link to="/settings#chat" className="text-[var(--accent)] underline-offset-2 hover:underline">
            ← Chat settings
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Compliance chat export</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          File download only. This panel never previews, parses, or logs export contents.
        </p>
      </header>

      <aside
        className="rounded-md border border-[color-mix(in_oklab,var(--danger)_40%,var(--border))] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] p-3 text-sm"
        role="note"
        data-testid="phi-warning"
      >
        <strong>Contains PHI.</strong> Handle under your organization&apos;s policy. Do not open the file in
        this browser session for browsing; store and review only in approved systems.
      </aside>

      <p className="text-xs text-[var(--muted)]">
        Access: currently <Badge tone="ok">admin</Badge> only (backend-enforced). A dedicated compliance role
        or two-person approval is deferred until policy is confirmed (Q1).
      </p>

      {status && (
        <p className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-sm" role="status" data-testid="export-status">
          {status}
        </p>
      )}
      {error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <h2 className="font-medium">Request export</h2>
        <div>
          <Label htmlFor="export-team">Team</Label>
          <select
            id="export-team"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            {(teams.data || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.id})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Scope supported by backend today: whole team. Date range / channel-type filters are not available yet.
          </p>
        </div>
        <div>
          <Label htmlFor="export-reason">Reason (required)</Label>
          <Input
            id="export-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Quarterly compliance SAMPLE review"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="export-format">Format</Label>
          <Input id="export-format" value="json" readOnly disabled />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Only JSON is supported by the backend currently (Q4 for additional formats / destination policy).
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          disabled={!reasonOk || !teamOk || exportMut.isPending || teams.isLoading}
          onClick={() => setConfirmOpen(true)}
        >
          Request download…
        </Button>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
        <h2 className="font-medium">Export history</h2>
        <p className="text-sm text-[var(--muted)]">
          Who / when / scope / reason / counts — never message content.
        </p>
        {history.isError && (
          <p className="text-sm text-[var(--danger)]">{userFacingMessage(history.error)}</p>
        )}
        {history.data?.rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" data-testid="export-history">
              <thead className="text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Actor</th>
                  <th className="py-2 pr-3">Team</th>
                  <th className="py-2 pr-3">Reason</th>
                  <th className="py-2 pr-3">Channels</th>
                  <th className="py-2 pr-3">Messages</th>
                  <th className="py-2">Format</th>
                </tr>
              </thead>
              <tbody>
                {history.data.rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--border)] align-top">
                    <td className="py-2 pr-3 whitespace-nowrap">{formatWhen(row.at)}</td>
                    <td className="py-2 pr-3">
                      <Link
                        className="text-[var(--accent)] underline-offset-2 hover:underline"
                        to={`/users?highlight=${encodeURIComponent(row.actor_id)}`}
                      >
                        {row.actor_id}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.team_id || '—'}</td>
                    <td className="py-2 pr-3 max-w-[14rem]">{row.reason}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.channel_count}</td>
                    <td className="py-2 pr-3 tabular-nums">{row.message_count}</td>
                    <td className="py-2">{row.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No export requests recorded.</p>
        )}
      </section>

      <ConfirmTypeDialog
        open={confirmOpen}
        title="Download compliance export?"
        description={
          <div className="space-y-2">
            <p>
              The file will contain PHI for team <span className="font-mono">{teamId}</span>. It will download
              only — not displayed here. Type EXPORT to confirm.
            </p>
            <p className="text-xs">Reason: {reason.trim()}</p>
          </div>
        }
        confirmWord="EXPORT"
        confirmLabel="Download file"
        danger
        busy={exportMut.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          await exportMut.mutateAsync();
        }}
      />
    </div>
  );
}
