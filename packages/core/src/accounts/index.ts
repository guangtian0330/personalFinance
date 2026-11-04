import type { CurrencyCode } from '../money/index.js';

export const ACCOUNT_KINDS = ['asset', 'liability', 'equity', 'income', 'expense'] as const;

export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/** A workspace-owned posting account. Balances are derived from ledger postings. */
export interface Account {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly kind: AccountKind;
  readonly currency: CurrencyCode;
  readonly liquidityClass: string | null;
  readonly archivedAt: string | null;
}
