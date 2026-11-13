import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { clearToken } from '@/api/token';
import { destroySession } from '@/auth/session';

afterEach(() => {
  cleanup();
  clearToken();
  destroySession();
  localStorage.clear();
  sessionStorage.clear();
});
