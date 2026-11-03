import { ApiErrorResponseSchema, HealthResponseSchema } from '@finpath/contracts';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/index.ts';

describe('M00-05: Vitest API smoke with real Hono and shared contracts', () => {
  it('validates the public health response', async () => {
    const response = await createApp().request('/api/v1/health');
    expect(response.status).toBe(200);
    expect(HealthResponseSchema.parse(await response.json())).toEqual({
      status: 'ok',
      service: 'finpath-api',
    });
  });

  it('returns a typed 400 for an unknown query', async () => {
    const response = await createApp().request('/api/v1/health?unexpected=synthetic');
    expect(response.status).toBe(400);
    expect(ApiErrorResponseSchema.parse(await response.json()).error.code).toBe('INVALID_REQUEST');
  });

  it('denies forged tenant selectors before private-route validation', async () => {
    const response = await createApp().request(
      '/api/v1/private/health?workspaceId=synthetic-foreign',
      {
        headers: { Authorization: 'Bearer synthetic-forged' },
      },
    );
    expect(response.status).toBe(401);
    expect(ApiErrorResponseSchema.parse(await response.json()).error.code).toBe('UNAUTHENTICATED');
  });
});
