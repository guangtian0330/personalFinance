import {
  API_PREFIX,
  EmptyQuerySchema,
  HealthCheckRequestSchema,
  HealthResponseSchema,
  type HealthResponse,
} from '@finpath/contracts';
import { Hono } from 'hono';
import { ApiFailure, errorResponse, type ApiEnvironment } from './errors.ts';

export function createApp() {
  const app = new Hono<ApiEnvironment>();
  const health: HealthResponse = HealthResponseSchema.parse({
    status: 'ok', service: 'finpath-api',
  });

  app.use('*', async (context, next) => {
    const requestId = crypto.randomUUID();
    context.set('requestId', requestId);
    context.header('X-Request-Id', requestId);
    context.header('Cache-Control', 'no-store');
    await next();
  });

  app.onError((error, context) => errorResponse(
    context, error instanceof ApiFailure ? error.code : 'INTERNAL_ERROR',
  ));
  app.notFound((context) => errorResponse(context, 'NOT_FOUND'));

  // Compatibility route keeps the M00-02 response and method semantics.
  app.get('/health', (context) => context.json(health));

  app.use(`${API_PREFIX}/*`, async (context, next) => {
    // URLSearchParams preserves empty names that router query helpers may drop.
    const query = Object.fromEntries(new URL(context.req.url).searchParams);
    if (!EmptyQuerySchema.safeParse(query).success) {
      throw new ApiFailure('INVALID_REQUEST');
    }
    await next();
  });

  app.get(`${API_PREFIX}/health`, (context) => context.json(health));

  // Stateless example exercises the shared request contract and error path.
  app.post(`${API_PREFIX}/health/check`, async (context) => {
    const mediaType = context.req.header('Content-Type')?.split(';')[0]?.trim().toLowerCase();
    if (mediaType !== 'application/json') throw new ApiFailure('INVALID_REQUEST');

    let input: unknown;
    try {
      input = await context.req.json<unknown>();
    } catch {
      throw new ApiFailure('INVALID_REQUEST');
    }
    if (!HealthCheckRequestSchema.safeParse(input).success) {
      throw new ApiFailure('INVALID_REQUEST');
    }
    return context.json(health);
  });

  return app;
}

export default createApp();
