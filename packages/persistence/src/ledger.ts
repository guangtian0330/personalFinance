import { and, asc, desc, eq, isNull, lt, or, sql } from 'drizzle-orm';
import type { Account } from '@finpath/core';
import type { JournalTransaction, Posting } from '@finpath/core';
import type { PersistenceDatabase } from './accounts.js';
import type { JournalCursor, JournalPage, LedgerRepository } from './repository.js';
import { accounts, journalTransactions, postings } from './schema.js';

export function createLedgerRepository(db: PersistenceDatabase): LedgerRepository {
  return {
    listAccounts: (workspaceId) => listActiveAccountsForWorkspace(db, workspaceId),
    findByIdempotencyKey: (workspaceId, idempotencyKey) =>
      getTransactionByIdempotencyKey(db, workspaceId, idempotencyKey),
    getTransaction: (workspaceId, transactionId) => getTransaction(db, workspaceId, transactionId),
    listTransactions: (workspaceId, limit, cursor) =>
      listTransactionsForWorkspace(db, workspaceId, limit, cursor),
    createAtomically: (transaction, idempotencyKey, requestHash) =>
      createJournalAtomically(db, transaction, idempotencyKey, requestHash),
  };
}

export async function listActiveAccountsForWorkspace(
  db: PersistenceDatabase,
  workspaceId: string,
): Promise<Account[]> {
  const rows = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.workspaceId, workspaceId), isNull(accounts.archivedAt)))
    .orderBy(asc(accounts.name), asc(accounts.id));
  return rows.map((row) => ({
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    kind: row.accountKind as Account['kind'],
    currency: row.currency as Account['currency'],
    liquidityClass: row.liquidityClass,
    archivedAt: row.archivedAt,
  }));
}

export async function getTransactionByIdempotencyKey(
  db: PersistenceDatabase,
  workspaceId: string,
  idempotencyKey: string,
): Promise<{
  readonly transaction: JournalTransaction;
  readonly requestHash: string | null;
} | null> {
  const [row] = await db
    .select()
    .from(journalTransactions)
    .where(
      and(
        eq(journalTransactions.workspaceId, workspaceId),
        eq(journalTransactions.idempotencyKey, idempotencyKey),
      ),
    )
    .limit(1);
  if (!row) return null;
  return {
    transaction: await getTransaction(db, workspaceId, row.id),
    requestHash: row.requestHash,
  };
}

export async function getTransaction(
  db: PersistenceDatabase,
  workspaceId: string,
  transactionId: string,
): Promise<JournalTransaction> {
  const [row] = await db
    .select()
    .from(journalTransactions)
    .where(
      and(
        eq(journalTransactions.workspaceId, workspaceId),
        eq(journalTransactions.id, transactionId),
      ),
    )
    .limit(1);
  if (!row) throw new RangeError('Transaction does not belong to this workspace');
  const entries = await db
    .select({
      id: postings.id,
      workspaceId: postings.workspaceId,
      transactionId: postings.transactionId,
      accountId: postings.accountId,
      side: postings.side,
      amountMinor: sql<string>`CAST(${postings.amountMinor} AS TEXT)`,
      currency: postings.currency,
    })
    .from(postings)
    .where(and(eq(postings.workspaceId, workspaceId), eq(postings.transactionId, transactionId)))
    .orderBy(asc(postings.id));
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    actorId: row.actorId,
    kind: row.kind as JournalTransaction['kind'],
    occurredAt: row.occurredAt,
    status: row.status as JournalTransaction['status'],
    description: row.description,
    reversalOfId: row.reversalOfId,
    postings: entries.map(
      (entry): Posting => ({
        id: entry.id,
        workspaceId: entry.workspaceId,
        transactionId: entry.transactionId,
        accountId: entry.accountId,
        side: entry.side as Posting['side'],
        amountMinor: BigInt(entry.amountMinor),
        currency: entry.currency as Posting['currency'],
      }),
    ),
  };
}

export async function listTransactionsForWorkspace(
  db: PersistenceDatabase,
  workspaceId: string,
  limit: number,
  cursor?: JournalCursor,
): Promise<JournalPage> {
  const scope = eq(journalTransactions.workspaceId, workspaceId);
  const before = cursor
    ? or(
        lt(journalTransactions.occurredAt, cursor.occurredAt),
        and(
          eq(journalTransactions.occurredAt, cursor.occurredAt),
          lt(journalTransactions.id, cursor.id),
        ),
      )
    : undefined;
  const rows = await db
    .select({ id: journalTransactions.id, occurredAt: journalTransactions.occurredAt })
    .from(journalTransactions)
    .where(before ? and(scope, before) : scope)
    .orderBy(desc(journalTransactions.occurredAt), desc(journalTransactions.id))
    .limit(limit + 1);
  const hasMore = rows.length > limit;
  const pageRows = rows.slice(0, limit);
  const items = await Promise.all(pageRows.map((row) => getTransaction(db, workspaceId, row.id)));
  return { items, hasMore };
}

/** D1 batch executes every statement atomically; a posting failure leaves no journal header. */
export async function createJournalAtomically(
  db: PersistenceDatabase,
  transaction: JournalTransaction,
  idempotencyKey: string,
  requestHash: string,
): Promise<void> {
  const transactionInsert = db.insert(journalTransactions).values({
    id: transaction.id,
    workspaceId: transaction.workspaceId,
    actorId: transaction.actorId,
    kind: transaction.kind,
    occurredAt: transaction.occurredAt,
    status: transaction.status,
    description: transaction.description,
    reversalOfId: transaction.reversalOfId,
    idempotencyKey,
    requestHash,
  });
  const postingInsert = db.insert(postings).values(
    transaction.postings.map((posting) => ({
      id: posting.id,
      workspaceId: posting.workspaceId,
      transactionId: posting.transactionId,
      accountId: posting.accountId,
      side: posting.side,
      amountMinor: posting.amountMinor,
      currency: posting.currency,
    })),
  );
  await db.batch([transactionInsert, postingInsert]);
}
