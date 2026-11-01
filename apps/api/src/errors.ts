import {
  API_ERRORS,
  ApiErrorResponseSchema,
  type ApiErrorResponse,
  type ErrorCode,
} from '@finpath/contracts';
import type { Context } from 'hono';

export type ApiEnvironment = { Variables: { requestId: string } };

export class ApiFailure extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode) {
    super(API_ERRORS[code].message);
    this.name = 'ApiFailure';
    this.code = code;
  }
}

export function errorResponse(context: Context<ApiEnvironment>, code: ErrorCode) {
  const definition = API_ERRORS[code];
  const body: ApiErrorResponse = ApiErrorResponseSchema.parse({
    error: {
      code,
      message: definition.message,
      details: {},
      requestId: context.get('requestId'),
    },
  });
  return context.json(body, definition.status);
}
