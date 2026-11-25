import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, createApiClient, InvalidApiResponseError } from '../dist/api-client.js';

const account = {
  id: 'cash',
  name: 'Checking',
  kind: 'asset',
  currency: 'CAD',
  liquidityClass: 'liquid',
};
const transaction = {
  id: 'transaction-1',
  kind: 'income',
  occurredAt: '2026-11-03T12:00:00.000Z',
  status: 'posted',
  description: 'Synthetic income',
  reversalOfId: null,
  postings: [
    {
      id: 'posting-1',
      accountId: 'cash',
      side: 'debit',
      amount: { amountMinor: '1250', currency: 'CAD' },
    },
    {
      id: 'posting-2',
      accountId: 'salary',
      side: 'credit',
      amount: { amountMinor: '1250', currency: 'CAD' },
    },
  ],
};

test('M01-05: account/history reads parse typed API payloads and follow cursor pagination', async () => {
  const calls = [];
  const client = createApiClient(async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/private/accounts')) return Response.json([account]);
    if (url.includes('cursor=next'))
      return Response.json({ items: [transaction], nextCursor: null });
    return Response.json({ items: [], nextCursor: 'next' });
  });
  assert.deepEqual(await client.getAccounts(), [account]);
  assert.deepEqual(await client.getTransactions(), { items: [], nextCursor: 'next' });
  assert.deepEqual(await client.getTransactions('next'), {
    items: [transaction],
    nextCursor: null,
  });
  assert.equal(calls[0].url, '/api/v1/private/accounts');
  assert.match(calls[1].url, /pageSize=100/);
  assert.match(calls[2].url, /cursor=next/);
  assert.equal(calls[0].options.cache, 'no-store');
});

test('M01-05: typed create sends only the form fields and mandatory idempotency key', async () => {
  let captured;
  const client = createApiClient(async (url, options) => {
    captured = { url, options };
    return Response.json(transaction, { status: 201 });
  });
  const input = {
    kind: 'income',
    occurredAt: '2026-11-03T12:00:00.000Z',
    description: 'Synthetic income',
    amount: { amountMinor: '1250', currency: 'CAD' },
    cashAccountId: 'cash',
    incomeAccountId: 'salary',
  };
  assert.deepEqual(await client.createTransaction(input, 'synthetic-key'), transaction);
  assert.equal(captured.url, '/api/v1/private/transactions');
  assert.equal(captured.options.headers['Idempotency-Key'], 'synthetic-key');
  assert.deepEqual(JSON.parse(captured.options.body), input);
  await assert.rejects(client.createTransaction({ ...input, workspaceId: 'forged' }, 'bad-key'));
});

test('M01-05: declined API errors keep their stable code and malformed payloads fail closed', async () => {
  const errorBody = {
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'The financial service is unavailable.',
      details: {},
      requestId: '00000000-0000-4000-8000-000000000003',
    },
  };
  await assert.rejects(
    createApiClient(async () => Response.json(errorBody, { status: 503 })).getAccounts(),
    (error) =>
      error instanceof ApiError &&
      error.status === 503 &&
      error.error.code === 'SERVICE_UNAVAILABLE',
  );
  await assert.rejects(
    createApiClient(async () =>
      Response.json([{ ...account, workspaceId: 'must-not-leak' }]),
    ).getAccounts(),
    InvalidApiResponseError,
  );
});
