import { describe, expect, it } from 'vitest';
import { ApiError, mapApiError } from './errors';

describe('mapApiError', () => {
  it('maps 403 to role message', () => {
    const err = mapApiError(403, { error: { code: 'forbidden', message: 'Nope' } });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe('Not allowed for your role');
    expect(err.code).toBe('forbidden');
  });

  it('maps 401 from body', () => {
    const err = mapApiError(401, { error: { code: 'unauthenticated', message: 'Sign in required' } });
    expect(err.status).toBe(401);
    expect(err.message).toBe('Sign in required');
  });
});
