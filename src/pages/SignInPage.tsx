import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { userFacingMessage } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';

export function SignInPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const reason = (location.state as { reason?: string } | null)?.reason;
  const from = (location.state as { from?: string } | null)?.from || '/';

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(userFacingMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">RoundsAI</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin panel</h1>
      <p className="mt-2 text-[var(--muted)]">
        Sign in with an admin account. Patient clinical content is never shown here.
      </p>

      {(reason === 'not_authorized' || error === 'Not authorized') && (
        <p className="mt-4 rounded-md border border-[var(--danger)]/40 bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2 text-sm" role="alert">
          Not authorized
        </p>
      )}

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </div>
        {error && error !== 'Not authorized' && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[var(--accent)] px-3 py-2.5 font-medium text-[var(--accent-fg)] disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
