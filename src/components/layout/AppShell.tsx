import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Users & teams' },
  { to: '/templates', label: 'Note templates' },
  { to: '/reminders', label: 'Reminder rules' },
  { to: '/questions', label: 'Question bank' },
  { to: '/curated-reads', label: 'Curated reads' },
  { to: '/guidelines', label: 'Guideline updates' },
  { to: '/analytics', label: 'Usage & analytics' },
  { to: '/settings/chat-metrics', label: 'Chat metrics' },
  { to: '/icd', label: 'ICD data' },
  { to: '/settings', label: 'Settings' },
  { to: '/audit', label: 'Audit log' },
];

export function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[220px_1fr]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className="border-b border-[var(--border)] bg-[var(--card)] lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">RoundsAI</p>
          <p className="mt-1 text-lg font-semibold">Admin</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible" aria-label="Main">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                  isActive
                    ? 'bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] font-medium text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:bg-[color-mix(in_oklab,var(--fg)_5%,transparent)] hover:text-[var(--fg)]',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-[var(--border)] px-5 py-4 lg:block">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-[var(--muted)]">{user?.email}</p>
          <Button type="button" variant="secondary" className="mt-3 w-full" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 lg:hidden">
          <p className="text-sm text-[var(--muted)]">{user?.email}</p>
          <Button type="button" variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
        <main id="main-content" tabIndex={-1} className="px-4 py-6 sm:px-6 lg:px-8 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
