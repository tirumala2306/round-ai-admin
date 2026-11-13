import { z } from 'zod';
import { ApiError, mapApiError } from './errors';
import { adminHealthSchema, loginResponseSchema, meSchema } from './schemas';
import { clearToken, getToken } from './token';

const baseUrl = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  auth?: boolean;
  signal?: AbortSignal;
  raw?: boolean;
};

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  const auth = opts.auth !== false;
  const token = opts.token === undefined ? (auth ? getToken() : null) : opts.token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl()}${path}`, {
    method: opts.method || (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (opts.raw) {
    if (!res.ok) {
      const body = await parseJson(res);
      throw mapApiError(res.status, body);
    }
    return (await res.text()) as T;
  }

  const body = await parseJson(res);
  if (!res.ok) {
    const err = mapApiError(res.status, body);
    if (err.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    throw err;
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(500, 'invalid_response', 'Unexpected response shape from API');
  }
  return parsed.data;
}

export function apiLogin(email: string, password: string) {
  return apiRequest('/auth/login', loginResponseSchema, {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

export function apiMe() {
  return apiRequest('/me', meSchema);
}

export function apiAdminHealth() {
  return apiRequest('/admin/health', adminHealthSchema);
}
