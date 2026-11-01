import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../../api/dist/index.js';
import { ApiError, InvalidApiResponseError, createApiClient } from '../dist/api-client.js';
import {
  errorResponse, health, healthCheck, invalidHealthChecks, invalidHealthResponses,
} from '../../../packages/contracts/tests/M00-03.fixtures.mjs';

test('M00-03: browser client and real Hono handler share GET and POST contracts', async () => {
  const calls = [];
  const controller = new AbortController();
  const client = createApiClient(async (url, options) => {
    calls.push({ url, options });
    return app.request(url, options);
  });
  assert.deepEqual(await client.getHealth(controller.signal), health);
  assert.deepEqual(await client.checkHealth(healthCheck, controller.signal), health);
  assert.deepEqual(calls.map((call) => call.url), ['/api/v1/health', '/api/v1/health/check']);
  assert.equal(calls[1].options.method, 'POST');
  assert.equal(calls[1].options.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[1].options.body), healthCheck);
  for (const call of calls) {
    assert.equal(call.options.cache, 'no-store');
    assert.equal(call.options.signal, controller.signal);
  }
});

test('M00-03: invalid client input is rejected before any HTTP request', async () => {
  const client = createApiClient(async () => assert.fail('invalid input must not reach transport'));
  for (const input of invalidHealthChecks) await assert.rejects(client.checkHealth(input), /Invalid health check request/);
});

test('M00-03: client exposes safe typed status, code and request ID from the real API', async () => {
  const client = createApiClient((url, options) => app.request(`${url}?unexpected=1`, options));
  await assert.rejects(client.getHealth(), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(error.error.code, 'INVALID_REQUEST');
    assert.equal(error.message, 'Invalid request.');
    assert.match(error.error.requestId, /^[0-9a-f-]{36}$/);
    assert.deepEqual(error.error.details, {});
    return true;
  });
});

test('M00-03: client rejects unexpected success shapes and unexpected success status', async () => {
  for (const payload of invalidHealthResponses) {
    await assert.rejects(createApiClient(async () => Response.json(payload)).getHealth(), InvalidApiResponseError);
  }
  await assert.rejects(createApiClient(async () => Response.json(health, { status: 201 })).getHealth(), InvalidApiResponseError);
});

test('M00-03: malformed JSON, unsafe error bodies and status/code mismatches are protocol errors', async () => {
  for (const response of [
    new Response('<html>synthetic proxy failure</html>', { status: 502 }),
    Response.json(errorResponse, { status: 500 }),
    Response.json({ ...errorResponse, stack: 'synthetic-private-stack' }, { status: 400 }),
    Response.json({ error: { ...errorResponse.error, requestId: 'not-a-uuid' } }, { status: 400 }),
    Response.json(health, { status: 400 }),
  ]) await assert.rejects(createApiClient(async () => response).getHealth(), InvalidApiResponseError);
});

test('M00-03: valid typed 404/500 errors retain their declared status and code', async () => {
  for (const [status, code, message] of [
    [404, 'NOT_FOUND', 'Resource not found.'],
    [500, 'INTERNAL_ERROR', 'An unexpected error occurred.'],
  ]) {
    const client = createApiClient(async () => Response.json({
      error: { ...errorResponse.error, code, message },
    }, { status }));
    await assert.rejects(client.getHealth(), (error) => error instanceof ApiError
      && error.status === status && error.error.code === code && error.message === message);
  }
});

test('M00-03: cancellation while reading the response body preserves its abort reason', async () => {
  const controller = new AbortController();
  const reason = new DOMException('Synthetic timeout', 'TimeoutError');
  const client = createApiClient(async () => ({
    ok: true,
    status: 200,
    async json() {
      controller.abort(reason);
      throw new DOMException('Synthetic aborted body read', 'AbortError');
    },
  }));
  await assert.rejects(client.getHealth(controller.signal), (error) => error === reason);
});
