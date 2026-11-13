/** In-memory only — never localStorage / sessionStorage. */
let accessToken: string | null = null;
let expiresAtMs = 0;

export function setToken(token: string, expiresInSeconds: number) {
  accessToken = token;
  expiresAtMs = Date.now() + expiresInSeconds * 1000;
}

export function clearToken() {
  accessToken = null;
  expiresAtMs = 0;
}

export function getToken(): string | null {
  if (!accessToken) return null;
  if (Date.now() >= expiresAtMs) {
    clearToken();
    return null;
  }
  return accessToken;
}

export function isTokenExpired(): boolean {
  return !accessToken || Date.now() >= expiresAtMs;
}

export function tokenExpiresAt(): number {
  return expiresAtMs;
}

/** Test helper — never use in app code. */
export function __peekTokenForTests() {
  return accessToken;
}
