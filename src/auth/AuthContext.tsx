import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiLogin, setUnauthorizedHandler } from '@/api/client';
import { ApiError } from '@/api/errors';
import { isPanelRole } from '@/api/schemas';
import {
  attachIdleListeners,
  destroySession,
  establishSession,
  getSessionUser,
  setSessionExpireHandler,
  type SessionUser,
} from '@/auth/session';

export type { SessionUser };

type AuthState = {
  user: SessionUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => getSessionUser());
  const [ready, setReady] = useState(false);

  const signOut = useCallback(() => {
    destroySession();
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionExpireHandler(() => setUser(null));
    setUnauthorizedHandler(() => {
      destroySession();
      setUser(null);
    });
    const detach = attachIdleListeners();
    setReady(true);
    return () => {
      detach();
      setSessionExpireHandler(null);
      setUnauthorizedHandler(null);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    if (!isPanelRole(res.user.role)) {
      throw new ApiError(403, 'not_authorized', 'Not authorized');
    }
    establishSession(res.token, res.expires_in, res.user);
    setUser(res.user);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
