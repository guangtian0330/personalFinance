import { sql } from 'drizzle-orm';
import {
  check,
  customType,
  foreignKey,
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const currencyCheck = sql`IN ('CAD', 'CNY', 'JPY')`;
const int64Money = customType<{ data: bigint; driverData: string }>({
  dataType: () => 'integer',
  toDriver: (value) => value.toString(),
  fromDriver: (value) => {
    const driverValue: unknown = value;
    if (typeof driverValue === 'number' && !Number.isSafeInteger(driverValue)) {
      throw new RangeError('SQLite returned an unsafe numeric amount; read int64 values as text');
    }
    return BigInt(driverValue as string | number | bigint);
  },
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  emailNormalized: text('email_normalized'),
  authProviderSubject: text('auth_provider_subject'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workspaces = sqliteTable(
  'workspaces',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    reportingCurrency: text('reporting_currency').notNull(),
    timezone: text('timezone').notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check('workspaces_reporting_currency_ck', sql`${table.reportingCurrency} ${currencyCheck}`),
  ],
);

export const memberships = sqliteTable(
  'memberships',
  {
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    check('memberships_role_ck', sql`${table.role} IN ('owner', 'editor', 'viewer')`),
  ],
);

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').notNull(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    name: text('name').notNull(),
    accountKind: text('account_kind').notNull(),
    currency: text('currency').notNull(),
    liquidityClass: text('liquidity_class'),
    archivedAt: text('archived_at'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.id] }),
    uniqueIndex('accounts_workspace_id_currency_uq').on(
      table.workspaceId,
      table.id,
      table.currency,
    ),
    check(
      'accounts_kind_ck',
      sql`${table.accountKind} IN ('asset', 'liability', 'equity', 'income', 'expense')`,
    ),
    check('accounts_currency_ck', sql`${table.currency} ${currencyCheck}`),
    index('accounts_workspace_name_idx').on(table.workspaceId, table.name),
  ],
);

export const journalTransactions = sqliteTable(
  'journal_transactions',
  {
    id: text('id').notNull(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id),
    actorId: text('actor_id').notNull(),
    kind: text('kind').notNull(),
    occurredAt: text('occurred_at').notNull(),
    status: text('status').notNull().default('posted'),
    description: text('description').notNull(),
    reversalOfId: text('reversal_of_id'),
    idempotencyKey: text('idempotency_key'),
    requestHash: text('request_hash'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.id] }),
    uniqueIndex('journal_transactions_idempotency_uq').on(table.workspaceId, table.idempotencyKey),
    foreignKey({
      columns: [table.workspaceId, table.reversalOfId],
      foreignColumns: [table.workspaceId, table.id],
      name: 'journal_transactions_reversal_fk',
    }),
    index('journal_transactions_workspace_occurred_idx').on(table.workspaceId, table.occurredAt),
  ],
);

export const postings = sqliteTable(
  'postings',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    transactionId: text('transaction_id').notNull(),
    accountId: text('account_id').notNull(),
    side: text('side').notNull(),
    amountMinor: int64Money('amount_minor').notNull(),
    currency: text('currency').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.workspaceId, table.transactionId],
      foreignColumns: [journalTransactions.workspaceId, journalTransactions.id],
      name: 'postings_workspace_transaction_fk',
    }),
    foreignKey({
      columns: [table.workspaceId, table.accountId, table.currency],
      foreignColumns: [accounts.workspaceId, accounts.id, accounts.currency],
      name: 'postings_workspace_account_currency_fk',
    }),
    check('postings_side_ck', sql`${table.side} IN ('debit', 'credit')`),
    check(
      'postings_amount_ck',
      sql`typeof(${table.amountMinor}) = 'integer' AND ${table.amountMinor} > 0`,
    ),
    check('postings_currency_ck', sql`${table.currency} ${currencyCheck}`),
    index('postings_workspace_account_idx').on(table.workspaceId, table.accountId),
    index('postings_workspace_transaction_idx').on(table.workspaceId, table.transactionId),
  ],
);

export const persistenceSchema = {
  users,
  workspaces,
  memberships,
  accounts,
  journalTransactions,
  postings,
};
