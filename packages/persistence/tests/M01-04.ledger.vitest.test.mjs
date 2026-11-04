import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/d1';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../../apps/api/src/index.ts';
import { createLedgerRepository, persistenceSchema } from '@finpath/persistence';

const migrationPaths = [
  new URL('../migrations/0000_m01_02_base_schema.sql', import.meta.url),
  new URL('../migrations/0001_m01_04_idempotency.sql', import.meta.url),
];
const migrations = migrationPaths.map((path) => readFileSync(path, 'utf8'));
const localAuth = {
  runtime: 'local-node',
  appEnv: 'development',
  nodeEnv: 'development',
  mockAuth: 'true',
};

class TestD1Statement {
  constructor(database, query, values = []) {
    this.database = database;
    this.query = query;
    this.values = values;
  }

  bind(...values) {
    return new TestD1Statement(this.database, this.query, values);
  }

  async run() {
    const statement = this.database.prepare(this.query);
    const result = statement.run(...this.values);
    return {
      success: true,
      results: [],
      meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) },
    };
  }

  async all() {
    const statement = this.database.prepare(this.query);
    statement.setReadBigInts(true);
    return { success: true, results: statement.all(...this.values), meta: {} };
  }

  async raw() {
    const statement = this.database.prepare(this.query);
    statement.setReadBigInts(true);
    const rows = statement.all(...this.values);
    return rows.map((row) => Object.values(row));
  }
}

function testD1Client(database) {
  let batchQueue = Promise.resolve();
  return {
    prepare: (query) => new TestD1Statement(database, query),
    batch(statements) {
      const run = batchQueue.then(async () => {
        database.exec('BEGIN');
        try {
          const results = await Promise.all(statements.map((statement) => statement.run()));
          database.exec('COMMIT');
          return results;
        } catch (error) {
          database.exec('ROLLBACK');
          throw error;
        }
      });
      batchQueue = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
  };
}

describe('M01-04 authenticated ledger REST and idempotency', () => {
  let nativeDb;
  let repository;
  let app;

  beforeEach(() => {
    nativeDb = new DatabaseSync(':memory:');
    nativeDb.exec('PRAGMA foreign_keys = ON');
    for (const migration of migrations) {
      for (const statement of migration.split('--> statement-breakpoint')) {
        if (statement.trim()) nativeDb.exec(statement);
      }
    }
    seedWorkspace('synthetic-local-workspace');
    seedWorkspace('workspace-b');
    seedAccounts('synthetic-local-workspace', [
      ['cash-a', 'Checking', 'asset', 'CAD'],
      ['savings-a', 'Savings', 'asset', 'CAD'],
      ['salary-a', 'Salary', 'income', 'CAD'],
      ['food-a', 'Groceries', 'expense', 'CAD'],
      ['card-a', 'Credit card', 'liability', 'CAD'],
      ['yen-a', 'Yen cash', 'asset', 'JPY'],
      ['archived-a', 'Archived', 'asset', 'CAD', '2026-11-01T00:00:00.000Z'],
    ]);
    seedAccounts('workspace-b', [
      ['cash-b', 'Other checking', 'asset', 'CAD'],
      ['salary-b', 'Other salary', 'income', 'CAD'],
    ]);
    const database = drizzle(testD1Client(nativeDb), { schema: persistenceSchema });
    repository = createLedgerRepository(database);
    app = createApp(localAuth, { ledger: repository });

    function seedWorkspace(id) {
      nativeDb.prepare('INSERT INTO users (id) VALUES (?)').run(`user-${id}`);
      nativeDb
        .prepare(
          'INSERT INTO workspaces (id, name, reporting_currency, timezone, created_by) VALUES (?, ?, ?, ?, ?)',
        )
        .run(id, `Workspace ${id}`, 'CAD', 'America/Toronto', `user-${id}`);
      nativeDb
        .prepare('INSERT INTO memberships (workspace_id, user_id, role) VALUES (?, ?, ?)')
        .run(id, `user-${id}`, 'owner');
    }

    function seedAccounts(workspaceId, rows) {
      const insert = nativeDb.prepare(
        'INSERT INTO accounts (id, workspace_id, name, account_kind, currency, archived_at) VALUES (?, ?, ?, ?, ?, ?)',
      );
      for (const [id, name, kind, currency, archivedAt = null] of rows) {
        insert.run(id, workspaceId, name, kind, currency, archivedAt);
      }
    }
  });

  afterEach(() => nativeDb.close());

  it('upgrades an existing M01-02 database without losing rows or requiring a legacy hash', () => {
    const upgradeDb = new DatabaseSync(':memory:');
    upgradeDb.exec('PRAGMA foreign_keys = ON');
    try {
      for (const statement of migrations[0].split('--> statement-breakpoint')) {
        if (statement.trim()) upgradeDb.exec(statement);
      }
      upgradeDb.prepare('INSERT INTO users (id) VALUES (?)').run('legacy-user');
      upgradeDb
        .prepare(
          'INSERT INTO workspaces (id, name, reporting_currency, timezone, created_by) VALUES (?, ?, ?, ?, ?)',
        )
        .run('legacy-workspace', 'Legacy workspace', 'CAD', 'UTC', 'legacy-user');
      upgradeDb
        .prepare(
          'INSERT INTO journal_transactions (id, workspace_id, actor_id, kind, occurred_at, description, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .run(
          'legacy-transaction',
          'legacy-workspace',
          'legacy-user',
          'income',
          '2026-11-03T00:00:00.000Z',
          'Synthetic legacy row',
          'legacy-key',
        );
      for (const statement of migrations[1].split('--> statement-breakpoint')) {
        if (statement.trim()) upgradeDb.exec(statement);
      }
      expect(
        upgradeDb
          .prepare('SELECT id, request_hash FROM journal_transactions WHERE id = ?')
          .get('legacy-transaction'),
      ).toEqual({ id: 'legacy-transaction', request_hash: null });
    } finally {
      upgradeDb.close();
    }
  });

  async function request(path, options = {}) {
    return app.request(`http://127.0.0.1:8787${path}`, options);
  }

  function incomeRequest(amountMinor = '1250', cashAccountId = 'cash-a') {
    return {
      kind: 'income',
      occurredAt: '2026-11-03T12:00:00.000Z',
      description: 'Synthetic paycheque',
      amount: { amountMinor, currency: 'CAD' },
      cashAccountId,
      incomeAccountId: 'salary-a',
    };
  }

  async function postTransaction(body, key = 'income-key') {
    return request('/api/v1/private/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(body),
    });
  }

  it('returns only active accounts in the trusted workspace', async () => {
    const response = await request('/api/v1/private/accounts');
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.map(({ id }) => id)).toEqual([
      'cash-a',
      'card-a',
      'food-a',
      'salary-a',
      'savings-a',
      'yen-a',
    ]);
    expect(JSON.stringify(body)).not.toContain('workspace-b');
  });

  it('fails closed when financial routes have no persistence repository configured', async () => {
    const unconfigured = createApp(localAuth);
    const response = await unconfigured.request('http://127.0.0.1:8787/api/v1/private/accounts');
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it('keeps opening-balance and other historical journal kinds readable', async () => {
    nativeDb
      .prepare(
        'INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES (?, ?, ?, ?, ?)',
      )
      .run('equity-a', 'synthetic-local-workspace', 'Opening equity', 'equity', 'CAD');
    nativeDb
      .prepare(
        'INSERT INTO journal_transactions (id, workspace_id, actor_id, kind, occurred_at, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        'opening-a',
        'synthetic-local-workspace',
        'synthetic-local-developer',
        'opening_balance',
        '2026-11-01T00:00:00.000Z',
        'posted',
        'Synthetic opening balance',
      );
    const addPosting = nativeDb.prepare(
      'INSERT INTO postings (id, workspace_id, transaction_id, account_id, side, amount_minor, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    addPosting.run(
      'opening-debit',
      'synthetic-local-workspace',
      'opening-a',
      'cash-a',
      'debit',
      500,
      'CAD',
    );
    addPosting.run(
      'opening-credit',
      'synthetic-local-workspace',
      'opening-a',
      'equity-a',
      'credit',
      500,
      'CAD',
    );

    const response = await request('/api/v1/private/transactions');
    expect(response.status).toBe(200);
    const page = await response.json();
    expect(page.items).toHaveLength(1);
    expect(page.items[0].kind).toBe('opening_balance');
  });

  it('atomically posts a balanced income and replays the identical result once', async () => {
    const original = await postTransaction(incomeRequest());
    expect(original.status).toBe(201);
    const originalBody = await original.json();
    expect(originalBody.kind).toBe('income');
    expect(originalBody.postings.map(({ side, amount }) => [side, amount.amountMinor])).toEqual([
      ['debit', '1250'],
      ['credit', '1250'],
    ]);

    const reordered = {
      incomeAccountId: 'salary-a',
      amount: { currency: 'CAD', amountMinor: '1250' },
      description: 'Synthetic paycheque',
      occurredAt: '2026-11-03T12:00:00.000Z',
      cashAccountId: 'cash-a',
      kind: 'income',
    };
    const replay = await postTransaction(reordered);
    expect(replay.status).toBe(201);
    expect(await replay.json()).toEqual(originalBody);
    expect(
      nativeDb
        .prepare(
          "SELECT COUNT(*) AS count FROM journal_transactions WHERE workspace_id = 'synthetic-local-workspace'",
        )
        .get().count,
    ).toBe(1);
    const totals = nativeDb
      .prepare(
        "SELECT side, CAST(SUM(amount_minor) AS TEXT) AS total FROM postings WHERE workspace_id = 'synthetic-local-workspace' GROUP BY side",
      )
      .all();
    expect(Object.fromEntries(totals.map(({ side, total }) => [side, total]))).toEqual({
      credit: '1250',
      debit: '1250',
    });
  });

  it('rejects idempotency-key reuse for a different normalized request', async () => {
    expect((await postTransaction(incomeRequest())).status).toBe(201);
    const response = await postTransaction(incomeRequest('1251'));
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe('CONFLICT');
    expect(
      nativeDb
        .prepare(
          "SELECT COUNT(*) AS count FROM journal_transactions WHERE workspace_id = 'synthetic-local-workspace'",
        )
        .get().count,
    ).toBe(1);
  });

  it('serializes simultaneous retries under the workspace idempotency constraint', async () => {
    let initialLookups = 0;
    let releaseLookups;
    const bothLookupsReady = new Promise((resolve) => {
      releaseLookups = resolve;
    });
    const synchronizedLedger = {
      ...repository,
      async findByIdempotencyKey(workspaceId, idempotencyKey) {
        const existing = await repository.findByIdempotencyKey(workspaceId, idempotencyKey);
        initialLookups += 1;
        if (initialLookups <= 2) {
          if (initialLookups === 2) releaseLookups();
          await bothLookupsReady;
        }
        return existing;
      },
    };
    app = createApp(localAuth, { ledger: synchronizedLedger });
    const responses = await Promise.all([
      postTransaction(incomeRequest(), 'concurrent-key'),
      postTransaction(incomeRequest(), 'concurrent-key'),
    ]);
    expect(responses.map(({ status }) => status)).toEqual([201, 201]);
    expect(await responses[0].json()).toEqual(await responses[1].json());
    expect(
      nativeDb
        .prepare(
          "SELECT COUNT(*) AS count FROM journal_transactions WHERE idempotency_key = 'concurrent-key'",
        )
        .get().count,
    ).toBe(1);
  });

  it('adapts expenses, card purchases and transfers into safe domain journals', async () => {
    const cashExpense = await postTransaction(
      {
        kind: 'expense',
        occurredAt: '2026-11-03T12:00:00.000Z',
        description: 'Synthetic groceries',
        amount: { amountMinor: '300', currency: 'CAD' },
        expenseAccountId: 'food-a',
        paymentAccountId: 'cash-a',
      },
      'expense-cash',
    );
    const cardExpense = await postTransaction(
      {
        kind: 'expense',
        occurredAt: '2026-11-03T12:00:01.000Z',
        description: 'Synthetic card groceries',
        amount: { amountMinor: '120', currency: 'CAD' },
        expenseAccountId: 'food-a',
        paymentAccountId: 'card-a',
      },
      'expense-card',
    );
    const transfer = await postTransaction(
      {
        kind: 'transfer',
        occurredAt: '2026-11-03T12:00:02.000Z',
        description: 'Synthetic savings transfer',
        amount: { amountMinor: '500', currency: 'CAD' },
        fromAccountId: 'cash-a',
        toAccountId: 'savings-a',
      },
      'transfer',
    );
    expect(cashExpense.status).toBe(201);
    expect(cardExpense.status).toBe(201);
    expect(transfer.status).toBe(201);
    expect((await cashExpense.json()).postings.map(({ side }) => side)).toEqual([
      'debit',
      'credit',
    ]);
    expect(
      (await cardExpense.json()).postings.map(({ accountId, side }) => [accountId, side]),
    ).toEqual([
      ['food-a', 'debit'],
      ['card-a', 'credit'],
    ]);
    expect(
      (await transfer.json()).postings.map(({ accountId, side }) => [accountId, side]),
    ).toEqual([
      ['savings-a', 'debit'],
      ['cash-a', 'credit'],
    ]);
    expect(
      nativeDb
        .prepare(
          "SELECT CAST(SUM(amount_minor) AS TEXT) AS total FROM postings WHERE workspace_id = 'synthetic-local-workspace' AND transaction_id IN (SELECT id FROM journal_transactions WHERE workspace_id = 'synthetic-local-workspace' AND kind = 'transfer')",
        )
        .get().total,
    ).toBe('1000');
  });

  it('rejects malformed input, missing keys, foreign accounts and cross-currency transfers without writes', async () => {
    expect((await request('/api/v1/private/transactions', { method: 'POST' })).status).toBe(400);
    expect(
      (
        await request('/api/v1/private/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'malformed' },
          body: '{',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await request('/api/v1/private/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incomeRequest()),
        })
      ).status,
    ).toBe(400);
    expect(
      (await postTransaction({ ...incomeRequest(), workspaceId: 'workspace-b' }, 'foreign-body'))
        .status,
    ).toBe(400);
    expect((await postTransaction(incomeRequest('100', 'cash-b'), 'foreign-account')).status).toBe(
      404,
    );
    expect(
      (
        await postTransaction(
          {
            kind: 'transfer',
            occurredAt: '2026-11-03T12:00:00.000Z',
            description: 'Synthetic invalid FX transfer',
            amount: { amountMinor: '1', currency: 'CAD' },
            fromAccountId: 'cash-a',
            toAccountId: 'yen-a',
          },
          'cross-currency',
        )
      ).status,
    ).toBe(422);
    expect(nativeDb.prepare('SELECT COUNT(*) AS count FROM journal_transactions').get().count).toBe(
      0,
    );
  });

  it('paginates by stable time and ID cursors within the workspace only', async () => {
    for (const [index, amount] of ['101', '102', '103'].entries()) {
      const result = await postTransaction(
        {
          ...incomeRequest(amount),
          occurredAt: `2026-11-03T12:00:0${index}.000Z`,
        },
        `page-${index}`,
      );
      expect(result.status).toBe(201);
    }
    const first = await request('/api/v1/private/transactions?pageSize=2');
    expect(first.status).toBe(200);
    const firstPage = await first.json();
    expect(firstPage.items.map(({ postings }) => postings[0].amount.amountMinor)).toEqual([
      '103',
      '102',
    ]);
    expect(firstPage.nextCursor).toBeTypeOf('string');
    const second = await request(
      `/api/v1/private/transactions?pageSize=2&cursor=${encodeURIComponent(firstPage.nextCursor)}`,
    );
    expect(
      (await second.json()).items.map(({ postings }) => postings[0].amount.amountMinor),
    ).toEqual(['101']);
    expect((await request('/api/v1/private/transactions?pageSize=101')).status).toBe(400);
    expect((await request('/api/v1/private/transactions?pageSize=2&pageSize=3')).status).toBe(400);
    expect((await request('/api/v1/private/transactions?unknown=x')).status).toBe(400);
  });

  it('preserves exact SQLite int64 amounts and rolls back a failed posting batch', async () => {
    const max = '9223372036854775807';
    const exact = await postTransaction(incomeRequest(max), 'int64');
    expect(exact.status).toBe(201);
    expect((await exact.json()).postings[0].amount.amountMinor).toBe(max);

    nativeDb.exec(
      "CREATE TRIGGER reject_synthetic_posting BEFORE INSERT ON postings WHEN NEW.amount_minor = 777 BEGIN SELECT RAISE(ABORT, 'synthetic persistence failure'); END",
    );
    const failed = await postTransaction(incomeRequest('777'), 'rollback');
    expect(failed.status).toBe(500);
    const row = nativeDb
      .prepare(
        "SELECT COUNT(*) AS count FROM journal_transactions WHERE idempotency_key = 'rollback'",
      )
      .get();
    expect(row.count).toBe(0);
    expect(
      nativeDb.prepare('SELECT COUNT(*) AS count FROM postings WHERE amount_minor = 777').get()
        .count,
    ).toBe(0);
  });
});
