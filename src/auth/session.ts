import type { Me } from '@/api/schemas';
import { clearToken, getToken, isTokenExpired, setToken, tokenExpiresAt } from '@/api/token';
import { abortPendingChatExports } from '@/features/chat/exportDownload';

const IDLE_MS = 15 * 60 * 1000;

export type SessionUser = Pick<Me, 'id' | 'email' | 'name' | 'role'>;

type SessionState = {
  user: SessionUser | null;
};

const state: SessionState = { user: null };
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;
let onExpire: (() => void) | null = null;

export function getSessionUser() {
  return state.user;
}

export function setSessionUser(user: SessionUser | null) {
  state.user = user;
}

export function establishSession(token: string, expiresIn: number, user: SessionUser) {
  setToken(token, expiresIn);
  state.user = user;
  armExpiryWatch();
  bumpIdle();
}

export function destroySession() {
  abortPendingChatExports();
  clearToken();
  state.user = null;
  if (idleTimer) clearTimeout(idleTimer);
  if (expiryTimer) clearTimeout(expiryTimer);
  idleTimer = null;
  expiryTimer = null;
}

export function setSessionExpireHandler(handler: (() => void) | null) {
  onExpire = handler;
}

function fireExpire() {
  destroySession();
  onExpire?.();
}

function armExpiryWatch() {
  if (expiryTimer) clearTimeout(expiryTimer);
  const ms = tokenExpiresAt() - Date.now();
  if (ms <= 0) {
    fireExpire();
    return;
  }
  expiryTimer = setTimeout(fireExpire, ms);
}

export function bumpIdle() {
  if (!getToken() || isTokenExpired()) return;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(fireExpire, IDLE_MS);
}

export function attachIdleListeners(target: Window = window) {
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
  const handler = () => bumpIdle();
  for (const e of events) target.addEventListener(e, handler, { passive: true });
  bumpIdle();
  return () => {
    for (const e of events) target.removeEventListener(e, handler);
  };
}

export const IDLE_TIMEOUT_MS = IDLE_MS;
