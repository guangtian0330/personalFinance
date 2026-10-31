import assert from 'node:assert/strict';
import test from 'node:test';
import { checkApiHealth } from '../dist/api-health.js';

test('M00-02: web accepts the API health payload via a fresh same-origin request', async () => {
  await checkApiHealth(undefined, async (url, options) => {
    assert.equal(url, '/health');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json({ status: 'ok', service: 'finpath-api' });
  });
});

test('M00-02: HTTP errors and a wrong service never appear connected', async () => {
  await assert.rejects(checkApiHealth(undefined, async () => new Response('', { status: 503 })));
  for (const payload of [null, {}, { status: 'ok' }, { status: 'ok', service: 'other-api' }]) {
    await assert.rejects(checkApiHealth(undefined, async () => Response.json(payload)));
  }
});

test('M00-02: malformed JSON from a wrong proxy target is rejected', async () => {
  await assert.rejects(checkApiHealth(undefined, async () => new Response('<html>not health</html>')));
});

test('M00-02: network failure remains an error and the next attempt can recover', async () => {
  await assert.rejects(checkApiHealth(undefined, async () => { throw new TypeError('Network failed'); }));
  await checkApiHealth(undefined, async () => Response.json({ status: 'ok', service: 'finpath-api' }));
});

test('M00-02: caller cancellation reaches the health request', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(checkApiHealth(controller.signal, async (_url, options) => {
    options.signal.throwIfAborted();
    return Response.json({ status: 'ok', service: 'finpath-api' });
  }), { name: 'AbortError' });
});
