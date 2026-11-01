import assert from 'node:assert/strict';
import test from 'node:test';
import { API_ERRORS, API_PREFIX, ApiErrorResponseSchema } from '@finpath/contracts';
import { createApp } from '../dist/index.js';
import { ApiFailure } from '../dist/errors.js';
import {
  health, healthCheck, invalidHealthChecks, invalidQueries,
} from '../../../packages/contracts/tests/M00-03.fixtures.mjs';

const app = createApp();
const post = (body, contentType = 'application/json') => ({
  method: 'POST', body, headers: contentType ? { 'Content-Type': contentType } : {},
});

async function assertError(response, code) {
  const definition = API_ERRORS[code];
  assert.equal(response.status, definition.status);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('content-type'), /^application\/json/);
  const payload = ApiErrorResponseSchema.parse(await response.json());
  assert.deepEqual(payload.error, {
    code, message: definition.message, details: {}, requestId: response.headers.get('x-request-id'),
  });
  return payload;
}

test('M00-03: versioned health GET and stateless POST return the same validated response', async () => {
  for (const [path, options] of [
    [`${API_PREFIX}/health`, undefined],
    [`${API_PREFIX}/health/check`, post(JSON.stringify(healthCheck), 'application/json; charset=utf-8')],
  ]) {
    const response = await app.request(path, options);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), health);
  }
});

test('M00-03: malformed JSON, wrong body shape and unknown trusted-identity fields return safe 400', async () => {
  for (const body of ['', '{invalid', ...invalidHealthChecks.map((input) => JSON.stringify(input))]) {
    await assertError(await app.request(`${API_PREFIX}/health/check`, post(body)), 'INVALID_REQUEST');
  }
});

test('M00-03: unsupported or missing JSON media type returns stable 400', async () => {
  for (const contentType of ['', 'text/plain', 'application/x-www-form-urlencoded']) {
    await assertError(await app.request(`${API_PREFIX}/health/check`, post(JSON.stringify(healthCheck), contentType)), 'INVALID_REQUEST');
  }
});

test('M00-03: both versioned endpoints reject unknown query fields', async () => {
  for (const query of invalidQueries) {
    await assertError(await app.request(`${API_PREFIX}/health${query}`), 'INVALID_REQUEST');
    await assertError(await app.request(`${API_PREFIX}/health/check${query}`, post(JSON.stringify(healthCheck))), 'INVALID_REQUEST');
  }
});

test('M00-03: absent routes and unsupported methods produce typed 404', async () => {
  for (const [path, options] of [
    ['/missing', undefined], [`${API_PREFIX}/missing`, undefined],
    [`${API_PREFIX}/health`, { method: 'POST' }], ['/health', { method: 'POST' }],
  ]) await assertError(await app.request(path, options), 'NOT_FOUND');
  // Prefix query validation precedes route resolution.
  await assertError(await app.request(`${API_PREFIX}/missing?unexpected=1`), 'INVALID_REQUEST');
});

test('M00-03: unexpected errors never disclose exception text, stack or causes', async () => {
  const isolatedApp = createApp();
  isolatedApp.get('/test-only-failure', () => {
    throw new Error('synthetic-private-error', { cause: new Error('synthetic-private-cause') });
  });
  const payload = await assertError(await isolatedApp.request('/test-only-failure'), 'INTERNAL_ERROR');
  assert.doesNotMatch(JSON.stringify(payload), /synthetic|stack|cause/);
  // This route exists only on the test instance, never on the exported app.
  await assertError(await app.request('/test-only-failure'), 'NOT_FOUND');
});

test('M00-03: typed failures use canonical public messages and fresh server request IDs', async () => {
  const isolatedApp = createApp();
  isolatedApp.get('/test-only-typed-failure', () => {
    const error = new ApiFailure('INVALID_REQUEST');
    error.message = 'synthetic-private-overridden-message';
    throw error;
  });
  const ids = new Set();
  for (let index = 0; index < 2; index += 1) {
    const payload = await assertError(await isolatedApp.request('/test-only-typed-failure', {
      headers: { 'X-Request-Id': 'synthetic-untrusted-request-id' },
    }), 'INVALID_REQUEST');
    ids.add(payload.error.requestId);
  }
  assert.equal(ids.size, 2);
  assert.ok(!ids.has('synthetic-untrusted-request-id'));
});
