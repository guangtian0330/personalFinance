import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/d1';
import { createLedgerRepository } from './ledger.js';
import type { LedgerRepository } from './repository.js';
import { persistenceSchema } from './schema.js';
import type { PersistenceDatabase } from './accounts.js';

type SqliteRow = Record<string, string | number | bigint | null>;
type D1Result = {
  readonly success: true;
  readonly results: SqliteRow[];
  readonly meta: { readonly changes: number; readonly last_row_id: number };
};

class LocalD1Statement {
  constructor(
    private readonly database: DatabaseSync,
    private readonly query: string,
    private readonly values: readonly SQLInputValue[] = [],
  ) {}

  bind(...values: SQLInputValue[]) {
    return new LocalD1Statement(this.database, this.query, values);
  }

  runSync(): D1Result {
    const result = this.database.prepare(this.query).run(...this.values);
    return {
      success: true,
      results: [],
      meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) },
    };
  }

  async run(): Promise<D1Result> {
    return this.runSync();
  }

  async all(): Promise<D1Result> {
    const statement = this.database.prepare(this.query);
    statement.setReadBigInts(true);
    return {
      success: true,
      results: statement.all(...this.values) as SqliteRow[],
      meta: { changes: 0, last_row_id: 0 },
    };
  }

  async raw(): Promise<unknown[][]> {
    const statement = this.database.prepare(this.query);
    statement.setReadBigInts(true);
    return statement.all(...this.values).map((row) => Object.values(row));
  }
}

function createLocalD1Client(database: DatabaseSync) {
  return {
    prepare(query: string) {
      return new LocalD1Statement(database, query);
    },
    async batch(statements: readonly LocalD1Statement[]): Promise<D1Result[]> {
      database.exec('BEGIN IMMEDIATE');
      try {
        const results = statements.map((statement) => statement.runSync());
        database.exec('COMMIT');
        return results;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

function findWorkspaceRoot(startDirectory: string): string {
  let current = resolve(startDirectory);
  while (true) {
    if (existsSync(join(current, 'pnpm-workspace.yaml'))) return current;
    const parent = dirname(current);
    if (parent === current) throw new Error('FinPath workspace root could not be located.');
    current = parent;
  }
}

const localRoot = findWorkspaceRoot(dirname(fileURLToPath(import.meta.url)));
const migrationPaths = [
  new URL('../migrations/0000_m01_02_base_schema.sql', import.meta.url),
  new URL('../migrations/0001_m01_04_idempotency.sql', import.meta.url),
];

export function defaultLocalDatabasePath(): string {
  return resolve(localRoot, '.local-data', 'finpath.sqlite3');
}

export function openLocalLedger(options: {
  readonly databasePath?: string;
  readonly seedDemoWorkspace: boolean;
}): {
  readonly ledger: LedgerRepository;
  close(): void;
} {
  const databasePath = resolve(options.databasePath ?? defaultLocalDatabasePath());
  mkdirSync(dirname(databasePath), { recursive: true });
  const native = new DatabaseSync(databasePath);
  native.exec('PRAGMA foreign_keys = ON');
  native.exec('PRAGMA busy_timeout = 5000');
  native.exec('PRAGMA journal_mode = WAL');
  native.exec('PRAGMA synchronous = FULL');

  try {
    applyMigrations(native);
    if (options.seedDemoWorkspace) seedDemoWorkspace(native);
    const client = createLocalD1Client(native) as never;
    const database = drizzle(client, { schema: persistenceSchema }) as PersistenceDatabase;
    return {
      ledger: createLedgerRepository(database),
      close() {
        native.close();
      },
    };
  } catch (error) {
    native.close();
    throw error;
  }
}

function applyMigrations(database: DatabaseSync): void {
  const hasBaseSchema = Boolean(
    database
      .prepare("SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'users'")
      .get(),
  );
  if (!hasBaseSchema) {
    executeMigration(database, migrationPaths[0]);
  }
  const journalColumns = database.prepare('PRAGMA table_info(journal_transactions)').all();
  if (!journalColumns.some((column) => column.name === 'request_hash')) {
    executeMigration(database, migrationPaths[1]);
  }
}

function executeMigration(database: DatabaseSync, path: URL | undefined): void {
  if (!path) throw new Error('Required local ledger migration is missing.');
  const migration = readFileSync(path, 'utf8');
  for (const statement of migration.split('--> statement-breakpoint')) {
    if (statement.trim()) database.exec(statement);
  }
}

function seedDemoWorkspace(database: DatabaseSync): void {
  const workspaceId = 'synthetic-local-workspace';
  const exists = database
    .prepare('SELECT 1 AS present FROM workspaces WHERE id = ?')
    .get(workspaceId);
  if (exists) return;

  database.exec('BEGIN IMMEDIATE');
  try {
    database.prepare('INSERT INTO users (id) VALUES (?)').run('synthetic-local-developer');
    database
      .prepare(
        'INSERT INTO workspaces (id, name, reporting_currency, timezone, created_by) VALUES (?, ?, ?, ?, ?)',
      )
      .run(
        workspaceId,
        'Local demo workspace',
        'CAD',
        'America/Toronto',
        'synthetic-local-developer',
      );
    database
      .prepare('INSERT INTO memberships (workspace_id, user_id, role) VALUES (?, ?, ?)')
      .run(workspaceId, 'synthetic-local-developer', 'owner');
    const insert = database.prepare(
      'INSERT INTO accounts (id, workspace_id, name, account_kind, currency, liquidity_class) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const demoAccounts: readonly [string, string, string, 'CAD', string | null][] = [
      ['demo-checking-cad', '日常账户', 'asset', 'CAD', 'liquid'],
      ['demo-savings-cad', '储蓄账户', 'asset', 'CAD', 'liquid'],
      ['demo-card-cad', '信用卡', 'liability', 'CAD', null],
      ['demo-opening-equity-cad', '期初权益', 'equity', 'CAD', null],
      ['demo-salary-cad', '工资收入', 'income', 'CAD', null],
      ['demo-food-cad', '日常支出', 'expense', 'CAD', null],
    ];
    for (const [id, name, kind, currency, liquidity] of demoAccounts) {
      insert.run(id, workspaceId, name, kind, currency, liquidity);
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}
