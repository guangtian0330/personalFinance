import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../dist/index.js';

test('M00-02: health returns deterministic JSON without caching', async () => {
  const response = await app.request('/health');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { status: 'ok', service: 'finpath-api' });
});

test('M00-02: an unknown endpoint cannot appear healthy', async () => {
  const response = await app.request('/health-missing');
  assert.equal(response.status, 404);
});

test('M00-02: health exposes no mutation endpoint', async () => {
  const response = await app.request('/health', { method: 'POST' });
  assert.equal(response.status, 404);
});
