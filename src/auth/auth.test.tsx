import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthContext';
import { RequireAuth } from '@/auth/RequireAuth';
import { SignInPage } from '@/pages/SignInPage';
import { establishSession, IDLE_TIMEOUT_MS, destroySession, setSessionExpireHandler } from '@/auth/session';
import { getToken } from '@/api/token';

function renderApp(initial = '/sign-in') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initial]}>
          <Routes>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/" element={<div>Dashboard ok</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('auth guard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/auth/login')) {
          const body = JSON.parse(String(init?.body || '{}')) as { email: string };
          if (body.email === 'resident@rounds.test') {
            return new Response(JSON.stringify({
              token: 't',
              expires_in: 3600,
              user: { id: '1', name: 'Res', email: body.email, role: 'resident' },
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({
            token: 'admin-token',
            expires_in: 3600,
            user: { id: '2', name: 'Admin', email: 'admin@rounds.test', role: 'admin' },
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: { code: 'not_found', message: 'no' } }), { status: 404 });
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    destroySession();
  });

  it('blocks non-admin roles with Not authorized', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText(/email/i), 'resident@rounds.test');
    await user.type(screen.getByLabelText(/password/i), 'ChangeMe-12345');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/not authorized/i);
    expect(getToken()).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('allows admin and protects routes', async () => {
    const user = userEvent.setup();
    renderApp('/');
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/email/i), 'admin@rounds.test');
    await user.type(screen.getByLabelText(/password/i), 'ChangeMe-12345');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Dashboard ok')).toBeInTheDocument();
    expect(getToken()).toBe('admin-token');
  });

  it('idle timeout signs out', () => {
    vi.useFakeTimers();
    try {
      const expired = vi.fn();
      setSessionExpireHandler(expired);
      establishSession('tok', 3600, { id: '2', name: 'Admin', email: 'a@b.c', role: 'admin' });
      expect(getToken()).toBe('tok');
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + 1);
      expect(expired).toHaveBeenCalledTimes(1);
      expect(getToken()).toBeNull();
    } finally {
      setSessionExpireHandler(null);
      destroySession();
      vi.useRealTimers();
    }
  });
});
