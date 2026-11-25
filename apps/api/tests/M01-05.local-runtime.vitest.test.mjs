import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/index.ts';
import { defaultLocalDatabasePath, openLocalLedger } from '@finpath/persistence/local-sqlite';

const localAuth = {
  runtime: 'local-node',
  appEnv: 'development',
  nodeEnv: 'development',
  mockAuth: 'true',
};

describe('M01-05 local persistent SQLite API runtime', () => {
  let directory;
  let store;

  afterEach(() => {
    store?.close();
    store = undefined;
    if (directory) rmSync(directory, { recursive: true, force: true });
    directory = undefined;
  });

  it('keeps the default database under the repository-local ignored data directory', () => {
    expect(defaultLocalDatabasePath()).toBe(join(process.cwd(), '.local-data', 'finpath.sqlite3'));
  });

  it('migrates, seeds synthetic CAD accounts, writes through the API and persists across reopen', async () => {
    directory = mkdtempSync(join(tmpdir(), 'finpath-m01-05-'));
    const databasePath = join(directory, 'ledger.sqlite3');
    store = openLocalLedger({ databasePath, seedDemoWorkspace: true });
    const app = createApp(localAuth, { ledger: store.ledger });

    const accountsResponse = await app.request('http://127.0.0.1:8787/api/v1/private/accounts');
    expect(accountsResponse.status).toBe(200);
    const accounts = await accountsResponse.json();
    expect(accounts.map(({ id }) => id)).toContain('demo-checking-cad');
    expect(accounts.map(({ id }) => id)).toContain('demo-salary-cad');
    expect(accounts.map(({ id }) => id)).toContain('demo-food-cad');

    const createResponse = await app.request('http://127.0.0.1:8787/api/v1/private/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'persistent-income' },
      body: JSON.stringify({
        kind: 'income',
        occurredAt: '2026-11-24T12:00:00.000Z',
        description: 'Synthetic local income',
        amount: { amountMinor: '12345', currency: 'CAD' },
        cashAccountId: 'demo-checking-cad',
        incomeAccountId: 'demo-salary-cad',
      }),
    });
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    expect(created.postings).toHaveLength(2);

    const beforeClose = await app.request(
      'http://127.0.0.1:8787/api/v1/private/transactions?pageSize=100',
    );
    expect((await beforeClose.json()).items.map(({ id }) => id)).toContain(created.id);
    store.close();
    store = undefined;

    store = openLocalLedger({ databasePath, seedDemoWorkspace: true });
    const reopenedApp = createApp(localAuth, { ledger: store.ledger });
    const afterOpen = await reopenedApp.request(
      'http://127.0.0.1:8787/api/v1/private/transactions?pageSize=100',
    );
    expect(afterOpen.status).toBe(200);
    const persisted = await afterOpen.json();
    expect(persisted.items).toHaveLength(1);
    expect(persisted.items[0]).toEqual(created);
  });
});
