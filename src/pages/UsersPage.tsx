import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  addTeamMember,
  createTeam,
  createUser,
  fetchTeams,
  fetchUsers,
  patchUser,
  removeTeamMember,
} from '@/api/admin';
import { isActiveFlag, userRoles, type AdminUser, type UserRole } from '@/api/schemas';
import { userFacingMessage } from '@/api/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmTypeDialog } from '@/components/ui/ConfirmTypeDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatWhen } from '@/lib/format';

export function UsersPage() {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const users = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });
  const teams = useQuery({ queryKey: ['admin-teams'], queryFn: fetchTeams });
  const teamName = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of teams.data || []) map.set(t.id, t.name);
    return map;
  }, [teams.data]);

  const [createOpen, setCreateOpen] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');
  const [deactivateUser, setDeactivateUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [memberTeamId, setMemberTeamId] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'resident' as UserRole,
    password: '',
    team_ids: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['admin-users'] }),
      qc.invalidateQueries({ queryKey: ['admin-teams'] }),
    ]);
  };

  const createMut = useMutation({
    mutationFn: () => createUser(form),
    onSuccess: async () => {
      setCreateOpen(false);
      setForm({ email: '', name: '', role: 'resident', password: '', team_ids: [] });
      await invalidate();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const patchMut = useMutation({
    mutationFn: (args: { id: string; body: Parameters<typeof patchUser>[1] }) =>
      patchUser(args.id, args.body),
    onSuccess: invalidate,
    onError: (e) => setError(userFacingMessage(e)),
  });

  const teamMut = useMutation({
    mutationFn: () => createTeam(teamNameInput.trim()),
    onSuccess: async () => {
      setTeamNameInput('');
      await invalidate();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const memberMut = useMutation({
    mutationFn: () => addTeamMember(memberTeamId, memberUserId),
    onSuccess: async () => {
      setMemberUserId('');
      await invalidate();
    },
    onError: (e) => setError(userFacingMessage(e)),
  });

  const removeMut = useMutation({
    mutationFn: (args: { teamId: string; userId: string }) => removeTeamMember(args.teamId, args.userId),
    onSuccess: invalidate,
    onError: (e) => setError(userFacingMessage(e)),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users & teams</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage accounts and team membership. Last login and last activity from the audit trail.
          </p>
        </div>
        <Button type="button" onClick={() => { setError(null); setCreateOpen(true); }}>
          Create user
        </Button>
      </header>

      {error && (
        <p className="rounded-md border border-[var(--danger)]/40 px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <section className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Teams</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users.data || []).map((u) => (
              <tr
                key={u.id}
                id={`user-${u.id}`}
                data-highlighted={highlightId === u.id ? 'true' : undefined}
                className={
                  highlightId === u.id
                    ? 'border-b border-[var(--border)] last:border-0 bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]'
                    : 'border-b border-[var(--border)] last:border-0'
                }
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-[var(--muted)]">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Role for ${u.email}`}
                    className="rounded-md border border-[var(--border)] bg-[var(--card)] px-2 py-1"
                    value={u.role}
                    onChange={(e) =>
                      patchMut.mutate({ id: u.id, body: { role: e.target.value as UserRole } })
                    }
                  >
                    {userRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {u.teams.map((id) => teamName.get(id) || id).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatWhen(u.last_login_at)}</td>
                <td className="px-4 py-3">
                  <Badge tone={isActiveFlag(u.active) ? 'ok' : 'danger'}>
                    {isActiveFlag(u.active) ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => { setResetPassword(''); setResetUser(u); }}>
                      Reset password
                    </Button>
                    {isActiveFlag(u.active) ? (
                      <Button type="button" variant="danger" onClick={() => setDeactivateUser(u)}>
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => patchMut.mutate({ id: u.id, body: { active: true } })}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Teams</h2>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (teamNameInput.trim()) teamMut.mutate();
          }}
        >
          <div>
            <Label htmlFor="new-team">New team name</Label>
            <Input id="new-team" value={teamNameInput} onChange={(e) => setTeamNameInput(e.target.value)} />
          </div>
          <Button type="submit" disabled={teamMut.isPending}>Create team</Button>
        </form>

        <div className="grid gap-4 lg:grid-cols-2">
          {(teams.data || []).map((t) => (
            <article key={t.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <h3 className="font-medium">{t.name}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {t.members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2">
                    <span>{m.name} <span className="text-[var(--muted)]">({m.email})</span></span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeMut.mutate({ teamId: t.id, userId: m.id })}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
                {!t.members.length && <li className="text-[var(--muted)]">No members</li>}
              </ul>
            </article>
          ))}
        </div>

        <form
          className="flex flex-wrap items-end gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (memberTeamId && memberUserId) memberMut.mutate();
          }}
        >
          <div>
            <Label htmlFor="add-team">Team</Label>
            <select
              id="add-team"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              value={memberTeamId}
              onChange={(e) => setMemberTeamId(e.target.value)}
            >
              <option value="">Select…</option>
              {(teams.data || []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="add-user">User</Label>
            <select
              id="add-user"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              value={memberUserId}
              onChange={(e) => setMemberUserId(e.target.value)}
            >
              <option value="">Select…</option>
              {(users.data || []).map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <Button type="submit">Add member</Button>
        </form>
      </section>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            className="w-full max-w-md space-y-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              createMut.mutate();
            }}
          >
            <h2 className="text-lg font-semibold">Create user</h2>
            <div>
              <Label htmlFor="cu-email">Email</Label>
              <Input id="cu-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cu-name">Name</Label>
              <Input id="cu-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cu-role">Role</Label>
              <select
                id="cu-role"
                className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                {userRoles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="cu-pass">Initial password (≥ 10 chars)</Label>
              <Input
                id="cu-pass"
                type="password"
                required
                minLength={10}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-medium">Teams</legend>
              <div className="space-y-1">
                {(teams.data || []).map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.team_ids.includes(t.id)}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          team_ids: e.target.checked
                            ? [...form.team_ids, t.id]
                            : form.team_ids.filter((id) => id !== t.id),
                        });
                      }}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMut.isPending}>Create</Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmTypeDialog
        open={!!deactivateUser}
        title="Deactivate user?"
        description={
          <>
            {deactivateUser?.email} will be unable to sign in. Type <strong>DEACTIVATE</strong> to confirm.
          </>
        }
        confirmWord="DEACTIVATE"
        confirmLabel="Deactivate"
        danger
        busy={patchMut.isPending}
        onClose={() => setDeactivateUser(null)}
        onConfirm={async () => {
          if (!deactivateUser) return;
          await patchMut.mutateAsync({ id: deactivateUser.id, body: { active: false } });
          setDeactivateUser(null);
        }}
      />

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            className="w-full max-w-md space-y-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5"
            onSubmit={(e) => {
              e.preventDefault();
              patchMut.mutate(
                { id: resetUser.id, body: { password: resetPassword } },
                { onSuccess: () => setResetUser(null) },
              );
            }}
          >
            <h2 className="text-lg font-semibold">Reset password</h2>
            <p className="text-sm text-[var(--muted)]">{resetUser.email}</p>
            <div>
              <Label htmlFor="rp">New password (≥ 10 chars)</Label>
              <Input
                id="rp"
                type="password"
                required
                minLength={10}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setResetUser(null)}>Cancel</Button>
              <Button type="submit" disabled={patchMut.isPending}>Save password</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
