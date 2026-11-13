import { z } from 'zod';

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function mapApiError(status: number, body: unknown): ApiError {
  const parsed = apiErrorSchema.safeParse(body);
  if (parsed.success) {
    const { code, message, details } = parsed.data.error;
    if (status === 403) {
      return new ApiError(403, code, 'Not allowed for your role', details);
    }
    return new ApiError(status, code, message, details);
  }
  if (status === 401) return new ApiError(401, 'unauthenticated', 'Sign in required');
  if (status === 403) return new ApiError(403, 'forbidden', 'Not allowed for your role');
  return new ApiError(status, 'unknown', `Request failed (${status})`);
}

export function userFacingMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
