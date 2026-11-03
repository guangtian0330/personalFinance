import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiErrorResponseSchema } from '@finpath/contracts';
import app, { createApp } from '../dist/index.js';
import {
  AuthConfigurationError,
  createAuthProvider,
  getAuthContext,
  requireAuth,
} from '../dist/auth.js';
import { ApiError, InvalidApiResponseError, createApiClient } from '../../web/dist/api-client.js';
import { identity, invalidConfigurations, localConfig, privateUrl } from './M00-04.fixtures.mjs';

async function assertUnauthenticated(response) {
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = ApiErrorResponseSchema.parse(await response.json());
  assert.deepEqual(body.error, {
    code: 'UNAUTHENTICATED',
    message: 'Authentication required.',
    details: {},
    requestId: response.headers.get('x-request-id'),
  });
  return body;
}

test('M00-04: default and explicitly disabled providers deny all unverified credentials', async () => {
  for (const config of [
    { runtime: 'deployed' },
    { ...localConfig, mockAuth: 'false' },
    { runtime: 'local-node' },
  ]) {
    const provider = createAuthProvider(config);
    for (const credential of [undefined, 'Bearer synthetic-forged', 'synthetic-session']) {
      assert.equal(await provider.authenticate(credential), null);
    }
  }
});

test('M00-04: only explicit local development returns a stable immutable synthetic identity', async () => {
  for (const nodeEnv of [undefined, 'development']) {
    const provider = createAuthProvider({ ...localConfig, nodeEnv });
    for (const credential of [undefined, 'Bearer synthetic-other-actor']) {
      const actual = await provider.authenticate(credential);
      assert.deepEqual(actual, identity);
      assert.equal(Object.isFrozen(actual), true);
      assert.throws(() => {
        actual.workspaceId = 'synthetic-foreign';
      }, TypeError);
    }
  }
});

test('M00-04: non-development, deployed, ambiguous and conflicting mock configurations fail closed', () => {
  for (const config of invalidConfigurations) {
    assert.throws(() => createAuthProvider(config), AuthConfigurationError);
    assert.throws(() => createApp(config), AuthConfigurationError);
  }
});

test('M00-04: anonymous GET/POST and forged identity selectors are rejected before validation', async () => {
  for (const options of [
    undefined,
    {
      headers: {
        Authorization: 'Bearer synthetic-forged',
        Cookie: 'session=synthetic-forged',
        'X-Actor-Id': 'synthetic-a',
        'X-Workspace-Id': 'synthetic-b',
      },
    },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId: 'synthetic-a', workspaceId: 'synthetic-b' }),
    },
  ]) {
    await assertUnauthenticated(await app.request(privateUrl, options));
    await assertUnauthenticated(
      await app.request(`${privateUrl}?workspaceId=synthetic-b`, options),
    );
  }
});

test('M00-04: local mock authenticates protected health and leaves public health unchanged', async () => {
  const localApp = createApp(localConfig);
  for (const url of [
    privateUrl,
    'http://127.0.0.1:8787/health',
    'http://127.0.0.1:8787/api/v1/health',
  ]) {
    const response = await localApp.request(url);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'finpath-api' });
  }
  // Authentication does not create unsupported mutation handlers.
  assert.equal((await localApp.request(privateUrl, { method: 'POST' })).status, 404);
});

test('M00-04: request context contains only trusted scope despite spoofed headers', async () => {
  const localApp = createApp(localConfig);
  localApp.get('/api/v1/private/test-context', (context) => context.json(getAuthContext(context)));
  const response = await localApp.request('http://127.0.0.1:8787/api/v1/private/test-context', {
    headers: {
      Authorization: 'Bearer synthetic-foreign',
      'X-Actor-Id': 'synthetic-foreign',
      'X-Workspace-Id': 'synthetic-foreign',
    },
  });
  assert.deepEqual(await response.json(), identity);
  assert.equal(
    (await createApp(localConfig).request('http://127.0.0.1:8787/api/v1/private/test-context'))
      .status,
    404,
  );
});

test('M00-04: mock rejects external hosts/origins and forwarding hints without trusting them', async () => {
  const localApp = createApp(localConfig);
  for (const headers of [
    { Host: 'synthetic.example' },
    { Origin: 'https://synthetic.example' },
    { Origin: 'null' },
    { Origin: 'http://127.0.0.1.synthetic.example:5173' },
    { 'Sec-Fetch-Site': 'cross-site' },
    { Forwarded: 'host=127.0.0.1:8787' },
    { 'X-Forwarded-Host': '127.0.0.1:8787' },
    { 'X-Forwarded-For': '127.0.0.1' },
    { 'X-Forwarded-Proto': 'http' },
  ])
    await assertUnauthenticated(await localApp.request(privateUrl, { headers }));
  await assertUnauthenticated(
    await localApp.request('https://synthetic.example/api/v1/private/health'),
  );
  for (const port of [5173, 4173]) {
    assert.equal(
      (
        await localApp.request(`http://127.0.0.1:${port}/api/v1/private/health`, {
          headers: { Origin: `http://127.0.0.1:${port}` },
        })
      ).status,
      200,
    );
  }
});

test('M00-04: portable bindings cannot activate mock auth even when labelled development', async () => {
  for (const APP_ENV of ['development', 'preview', 'staging', 'production']) {
    for (const url of ['/health', privateUrl]) {
      const response = await app.request(url, undefined, { APP_ENV, MOCK_AUTH: 'true' });
      assert.equal(response.status, 500);
      const body = ApiErrorResponseSchema.parse(await response.json());
      assert.equal(body.error.code, 'INTERNAL_ERROR');
      assert.doesNotMatch(JSON.stringify(body), /stack|MOCK_AUTH|development|configuration/);
    }
  }
  await assertUnauthenticated(
    await app.request(privateUrl, undefined, { APP_ENV: 'development', MOCK_AUTH: 'false' }),
  );
});

test('M00-04: concurrent authenticated and anonymous requests never share tenant context', async () => {
  const isolatedApp = createApp();
  const contexts = [];
  const provider = {
    async authenticate(credential) {
      if (credential === 'synthetic-token-a')
        return { actorId: 'synthetic-a', workspaceId: 'synthetic-workspace-a' };
      if (credential === 'synthetic-token-b')
        return { actorId: 'synthetic-b', workspaceId: 'synthetic-workspace-b' };
      return null;
    },
  };
  isolatedApp.get('/test-scope', requireAuth(provider), async (context) => {
    const scope = getAuthContext(context);
    contexts.push(scope);
    await Promise.resolve();
    return context.json(getAuthContext(context));
  });
  const responses = await Promise.all(
    ['a', 'b', 'forged'].map((suffix) =>
      isolatedApp.request('/test-scope', {
        headers: { Authorization: `synthetic-token-${suffix}` },
      }),
    ),
  );
  assert.deepEqual(await responses[0].json(), {
    actorId: 'synthetic-a',
    workspaceId: 'synthetic-workspace-a',
  });
  assert.deepEqual(await responses[1].json(), {
    actorId: 'synthetic-b',
    workspaceId: 'synthetic-workspace-b',
  });
  await assertUnauthenticated(responses[2]);
  assert.equal(contexts.length, 2);
  assert.notEqual(contexts[0], contexts[1]);
  assert.ok(contexts.every(Object.isFrozen));
});

test('M00-04: local mock cannot be repurposed through bindings or a mutated startup config', async () => {
  const config = { ...localConfig };
  const localApp = createApp(config);
  config.mockAuth = 'false';
  await assertUnauthenticated(
    await localApp.request('https://synthetic.example/api/v1/private/health'),
  );
  for (const binding of [
    { APP_ENV: 'production' },
    { NODE_ENV: 'production' },
    { MOCK_AUTH: 'false' },
    { APP_ENV: 'development' },
  ]) {
    const response = await localApp.request(privateUrl, undefined, binding);
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error.code, 'INTERNAL_ERROR');
  }
});

test('M00-04: absent middleware and incomplete provider identity fail closed', async () => {
  const isolatedApp = createApp();
  isolatedApp.get('/test-no-middleware', (context) => context.json(getAuthContext(context)));
  await assertUnauthenticated(await isolatedApp.request('/test-no-middleware'));
  for (const value of [
    null,
    {},
    { actorId: 'synthetic-a' },
    { actorId: '', workspaceId: 'synthetic-a' },
  ]) {
    const instance = createApp();
    instance.get(
      '/test-invalid-identity',
      requireAuth({ authenticate: async () => value }),
      (context) => context.json(getAuthContext(context)),
    );
    await assertUnauthenticated(await instance.request('/test-invalid-identity'));
  }
});

test('M00-04: provider exceptions are sanitized without authenticating the request', async () => {
  const isolatedApp = createApp();
  isolatedApp.get(
    '/test-provider-error',
    requireAuth({
      authenticate: async () => {
        throw new Error('synthetic-private-provider-secret');
      },
    }),
    () => assert.fail('protected handler must not run'),
  );
  const response = await isolatedApp.request('/test-provider-error');
  assert.equal(response.status, 500);
  const payload = await response.json();
  assert.equal(payload.error.code, 'INTERNAL_ERROR');
  assert.doesNotMatch(JSON.stringify(payload), /synthetic|stack|secret/);
});

test('M00-04: existing Web adapter recognizes the additive 401 error contract', async () => {
  const client = createApiClient((_url, options) => app.request(privateUrl, options));
  await assert.rejects(
    client.getHealth(),
    (error) =>
      error instanceof ApiError && error.status === 401 && error.error.code === 'UNAUTHENTICATED',
  );
  const mismatch = createApiClient(async () => {
    const body = await (await app.request(privateUrl)).json();
    return Response.json(body, { status: 403 });
  });
  await assert.rejects(mismatch.getHealth(), InvalidApiResponseError);
});
