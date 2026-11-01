import { z } from 'zod';

export const API_PREFIX = '/api/v1';

export const HealthResponseSchema = z.strictObject({
  status: z.literal('ok'),
  service: z.literal('finpath-api'),
});

export const HealthCheckRequestSchema = z.strictObject({
  check: z.literal('health'),
});

export const EmptyQuerySchema = z.strictObject({});

export const ErrorCodeSchema = z.enum([
  'INVALID_REQUEST', 'NOT_FOUND', 'INTERNAL_ERROR',
]);

export const ApiErrorResponseSchema = z.strictObject({
  error: z.strictObject({
    code: ErrorCodeSchema,
    message: z.string().min(1).max(160),
    details: z.strictObject({}),
    requestId: z.uuid(),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type HealthCheckRequest = z.infer<typeof HealthCheckRequestSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// Public messages are fixed here. Exception text and input values stay private.
export const API_ERRORS = {
  INVALID_REQUEST: { status: 400, message: 'Invalid request.' },
  NOT_FOUND: { status: 404, message: 'Resource not found.' },
  INTERNAL_ERROR: { status: 500, message: 'An unexpected error occurred.' },
} as const satisfies Record<ErrorCode, { status: number; message: string }>;
