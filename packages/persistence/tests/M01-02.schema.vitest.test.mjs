import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { listAccountsForWorkspace } from '../src/accounts.ts';
import { persistenceSchema } from '../src/schema.ts';

const migrationPath = new URL('../migrations/0000_m01_02_base_schema.sql', import.meta.url);
const migration = readFileSync(migrationPath, 'utf8');

describe('M01-02 fresh SQLite schema and tenant scoping', () => {
  let nativeDb;
  let db;

  beforeEach(() => {
    nativeDb = new DatabaseSync(':memory:');
    nativeDb.exec('PRAGMA foreign_keys = ON');
    for (const statement of migration.split('--> statement-breakpoint')) {
      if (statement.trim()) nativeDb.exec(statement);
    }
    db = drizzle(
      async (query, params, method) => {
        const statement = nativeDb.prepare(query);
        statement.setReturnArrays(true);
        if (method === 'run') {
          statement.run(...params);
          return { rows: [] };
        }
        if (method === 'get') {
          const row = statement.get(...params);
          return { rows: row ? [row] : [] };
        }
        return { rows: statement.all(...params) };
      },
      { schema: persistenceSchema },
    );
  });

  afterEach(() => nativeDb.close());

  function addWorkspace(id, name) {
    nativeDb.prepare('INSERT INTO users (id) VALUES (?)').run(`user-${id}`);
    nativeDb
      .prepare(
        'INSERT INTO workspaces (id, name, reporting_currency, timezone, created_by) VALUES (?, ?, ?, ?, ?)',
      )
      .run(id, name, 'CAD', 'America/Toronto', `user-${id}`);
    nativeDb
      .prepare('INSERT INTO memberships (workspace_id, user_id, role) VALUES (?, ?, ?)')
      .run(id, `user-${id}`, 'owner');
  }

  it('applies generated migration to a fresh in-memory database', () => {
    const names = nativeDb
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map(({ name }) => name);
    expect(names).toEqual([
      'accounts',
      'journal_transactions',
      'memberships',
      'postings',
      'users',
      'workspaces',
    ]);
    expect(nativeDb.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
  });

  it('rejects unsupported currencies and invalid posting amounts', () => {
    addWorkspace('workspace-a', 'A');
    assert.throws(() => {
      nativeDb
        .prepare(
          "INSERT INTO workspaces (id, name, reporting_currency, timezone, created_by) VALUES ('workspace-bad', 'Bad', 'USD', 'UTC', 'user-workspace-a')",
        )
        .run();
    }, /CHECK constraint failed/);
    assert.throws(() => {
      nativeDb
        .prepare(
          "INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES ('bad', 'workspace-a', 'Bad', 'asset', 'USD')",
        )
        .run();
    }, /CHECK constraint failed/);

    nativeDb
      .prepare(
        "INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES ('cash', 'workspace-a', 'Cash', 'asset', 'CAD')",
      )
      .run();
    nativeDb
      .prepare(
        "INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES ('equity', 'workspace-a', 'Opening equity', 'equity', 'CAD')",
      )
      .run();
    nativeDb
      .prepare(
        "INSERT INTO journal_transactions (id, workspace_id, actor_id, kind, occurred_at, description) VALUES ('opening', 'workspace-a', 'user-a', 'opening_balance', '2026-11-03T12:00:00.000Z', 'Synthetic opening balance')",
      )
      .run();
    assert.throws(() => {
      nativeDb
        .prepare(
          "INSERT INTO postings (id, workspace_id, transaction_id, account_id, side, amount_minor, currency) VALUES ('bad-posting', 'workspace-a', 'opening', 'cash', 'debit', 0, 'CAD')",
        )
        .run();
    }, /CHECK constraint failed/);
  });

  it('records a balanced opening journal and rejects cross-workspace account references', () => {
    addWorkspace('workspace-a', 'A');
    addWorkspace('workspace-b', 'B');
    for (const [workspaceId, accountId, name, kind] of [
      ['workspace-a', 'cash-a', 'Cash', 'asset'],
      ['workspace-a', 'equity-a', 'Opening equity', 'equity'],
      ['workspace-b', 'cash-b', 'Cash', 'asset'],
    ]) {
      nativeDb
        .prepare(
          'INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES (?, ?, ?, ?, ?)',
        )
        .run(accountId, workspaceId, name, kind, 'CAD');
    }
    nativeDb
      .prepare(
        "INSERT INTO journal_transactions (id, workspace_id, actor_id, kind, occurred_at, description) VALUES ('opening-a', 'workspace-a', 'user-workspace-a', 'opening_balance', '2026-11-03T12:00:00.000Z', 'Synthetic opening balance')",
      )
      .run();
    const addPosting = nativeDb.prepare(
      'INSERT INTO postings (id, workspace_id, transaction_id, account_id, side, amount_minor, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
    );
    addPosting.run('debit-a', 'workspace-a', 'opening-a', 'cash-a', 'debit', 10_000, 'CAD');
    addPosting.run('credit-a', 'workspace-a', 'opening-a', 'equity-a', 'credit', 10_000, 'CAD');

    const totals = nativeDb
      .prepare(
        "SELECT side, SUM(amount_minor) AS total FROM postings WHERE workspace_id = 'workspace-a' AND transaction_id = 'opening-a' GROUP BY side",
      )
      .all();
    expect(Object.fromEntries(totals.map(({ side, total }) => [side, total]))).toEqual({
      credit: 10_000,
      debit: 10_000,
    });

    assert.throws(() => {
      addPosting.run('cross-tenant', 'workspace-a', 'opening-a', 'cash-b', 'debit', 1, 'CAD');
    }, /FOREIGN KEY constraint failed/);
    expect(
      nativeDb.prepare("SELECT COUNT(*) AS count FROM postings WHERE id = 'cross-tenant'").get()
        .count,
    ).toBe(0);
  });

  it('returns only accounts owned by the requested workspace', async () => {
    addWorkspace('workspace-a', 'A');
    addWorkspace('workspace-b', 'B');
    const insertAccount = nativeDb.prepare(
      'INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES (?, ?, ?, ?, ?)',
    );
    insertAccount.run('cash-a', 'workspace-a', 'Cash A', 'asset', 'CAD');
    insertAccount.run('cash-b', 'workspace-b', 'Cash B', 'asset', 'CAD');

    const results = await listAccountsForWorkspace(db, 'workspace-a');
    expect(results.map(({ id, workspaceId }) => [id, workspaceId])).toEqual([
      ['cash-a', 'workspace-a'],
    ]);
  });
});
