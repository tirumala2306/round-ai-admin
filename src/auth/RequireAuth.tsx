import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isPanelRole } from '@/api/schemas';
import { useAuth } from '@/auth/AuthContext';

export function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-[var(--muted)]" role="status">
        Checking session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (!isPanelRole(user.role)) {
    return <Navigate to="/sign-in" replace state={{ reason: 'not_authorized' }} />;
  }

  return <Outlet />;
}
