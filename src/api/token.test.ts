import { describe, expect, it } from 'vitest';
import { __peekTokenForTests, clearToken, getToken, setToken } from './token';

describe('token store', () => {
  it('keeps token in memory only', () => {
    setToken('abc', 3600);
    expect(getToken()).toBe('abc');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    clearToken();
    expect(__peekTokenForTests()).toBeNull();
  });

  it('expires after TTL', () => {
    setToken('abc', -1);
    expect(getToken()).toBeNull();
  });
});
