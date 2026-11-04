import type { Account, JournalTransaction } from '@finpath/core';

export interface JournalCursor {
  readonly occurredAt: string;
  readonly id: string;
}

export interface JournalPage {
  readonly items: readonly JournalTransaction[];
  readonly hasMore: boolean;
}

export interface LedgerRepository {
  listAccounts(workspaceId: string): Promise<Account[]>;
  findByIdempotencyKey(
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<{
    readonly transaction: JournalTransaction;
    readonly requestHash: string | null;
  } | null>;
  getTransaction(workspaceId: string, transactionId: string): Promise<JournalTransaction>;
  listTransactions(
    workspaceId: string,
    limit: number,
    cursor?: JournalCursor,
  ): Promise<JournalPage>;
  createAtomically(
    transaction: JournalTransaction,
    idempotencyKey: string,
    requestHash: string,
  ): Promise<void>;
}
