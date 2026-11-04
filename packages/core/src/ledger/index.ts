import type { Account, AccountKind } from '../accounts/index.js';
import { addMoney, fromJsonMoney, type CurrencyCode, type Money } from '../money/index.js';

export type PostingSide = 'debit' | 'credit';
export type JournalKind =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'refund'
  | 'reversal'
  | 'loan_payment'
  | 'card_settlement'
  | 'opening_balance';
export const JOURNAL_KINDS = [
  'income',
  'expense',
  'transfer',
  'refund',
  'reversal',
  'loan_payment',
  'card_settlement',
  'opening_balance',
] as const satisfies readonly JournalKind[];
export type JournalStatus = 'posted' | 'reversed';

export interface Posting {
  readonly id: string;
  readonly workspaceId: string;
  readonly transactionId: string;
  readonly accountId: string;
  readonly side: PostingSide;
  readonly amountMinor: bigint;
  readonly currency: CurrencyCode;
}

export interface JournalTransaction {
  readonly id: string;
  readonly workspaceId: string;
  readonly actorId: string;
  readonly kind: JournalKind;
  readonly occurredAt: string;
  readonly status: JournalStatus;
  readonly description: string;
  readonly reversalOfId: string | null;
  readonly postings: readonly Posting[];
}

export interface JournalReversal {
  readonly original: JournalTransaction;
  readonly reversal: JournalTransaction;
}

export interface JournalInput {
  readonly id: string;
  readonly workspaceId: string;
  readonly actorId: string;
  readonly occurredAt: string;
  readonly description: string;
}

export interface TransactionAmounts {
  readonly amount: Money;
  readonly cashAccountId: string;
}

export interface PostingDraft {
  readonly accountId: string;
  readonly side: PostingSide;
  readonly amount: Money;
}

export function createJournalTransaction(
  input: JournalInput & {
    readonly kind: JournalKind;
    readonly postings: readonly PostingDraft[];
  },
  accounts: readonly Account[],
): JournalTransaction {
  return buildJournalTransaction({ ...input, reversalOfId: null }, accounts);
}

function buildJournalTransaction(
  input: JournalInput & {
    readonly kind: JournalKind;
    readonly postings: readonly PostingDraft[];
    readonly reversalOfId: string | null;
  },
  accounts: readonly Account[],
): JournalTransaction {
  assertJournalInput(input);
  if (!(JOURNAL_KINDS as readonly string[]).includes(input.kind)) {
    throw new TypeError('Unsupported journal transaction kind');
  }
  if (input.postings.length < 2) {
    throw new RangeError('A journal transaction requires at least two postings');
  }

  const debitTotals = new Map<CurrencyCode, Money>();
  const creditTotals = new Map<CurrencyCode, Money>();
  const postings = input.postings.map((draft, index): Posting => {
    if (draft.side !== 'debit' && draft.side !== 'credit') {
      throw new TypeError('Posting side must be debit or credit');
    }
    const account = findAccount(accounts, input.workspaceId, draft.accountId);
    assertPositiveMoney(draft.amount);
    if (account.currency !== draft.amount.currency) {
      throw new RangeError('Posting currency must match its account currency');
    }

    const totals = draft.side === 'debit' ? debitTotals : creditTotals;
    totals.set(
      draft.amount.currency,
      addMoney(
        totals.get(draft.amount.currency) ?? { amountMinor: 0n, currency: draft.amount.currency },
        draft.amount,
      ),
    );

    return Object.freeze({
      id: JSON.stringify([input.workspaceId, input.id, index + 1]),
      workspaceId: input.workspaceId,
      transactionId: input.id,
      accountId: account.id,
      side: draft.side,
      amountMinor: draft.amount.amountMinor,
      currency: draft.amount.currency,
    });
  });

  const currencies = new Set([...debitTotals.keys(), ...creditTotals.keys()]);
  for (const currency of currencies) {
    const debit = debitTotals.get(currency);
    const credit = creditTotals.get(currency);
    if (!debit || !credit || debit.amountMinor !== credit.amountMinor) {
      throw new RangeError(`Journal transaction is not balanced in ${currency}`);
    }
  }

  return Object.freeze({
    id: input.id,
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    kind: input.kind,
    occurredAt: input.occurredAt,
    status: 'posted',
    description: input.description,
    reversalOfId: input.reversalOfId ?? null,
    postings: Object.freeze(postings),
  });
}

export function createIncomeTransaction(
  input: JournalInput & TransactionAmounts & { readonly incomeAccountId: string },
  accounts: readonly Account[],
): JournalTransaction {
  const cash = findAccount(accounts, input.workspaceId, input.cashAccountId);
  const income = findAccount(accounts, input.workspaceId, input.incomeAccountId);
  requireKind(cash, ['asset'], 'Income must be deposited to an asset account');
  requireKind(income, ['income'], 'Income must be credited to an income account');
  return createJournalTransaction(
    {
      ...input,
      kind: 'income',
      postings: [
        { accountId: cash.id, side: 'debit', amount: input.amount },
        { accountId: income.id, side: 'credit', amount: input.amount },
      ],
    },
    accounts,
  );
}

export function createExpenseTransaction(
  input: JournalInput &
    TransactionAmounts & { readonly expenseAccountId: string; readonly paymentAccountId: string },
  accounts: readonly Account[],
): JournalTransaction {
  const expense = findAccount(accounts, input.workspaceId, input.expenseAccountId);
  const payment = findAccount(accounts, input.workspaceId, input.paymentAccountId);
  requireKind(expense, ['expense'], 'Expense must be posted to an expense account');
  requireKind(
    payment,
    ['asset', 'liability'],
    'Expense must be paid by an asset or card liability',
  );
  return createJournalTransaction(
    {
      ...input,
      kind: 'expense',
      postings: [
        { accountId: expense.id, side: 'debit', amount: input.amount },
        { accountId: payment.id, side: 'credit', amount: input.amount },
      ],
    },
    accounts,
  );
}

export function createTransferTransaction(
  input: JournalInput & {
    readonly amount: Money;
    readonly fromAccountId: string;
    readonly toAccountId: string;
  },
  accounts: readonly Account[],
): JournalTransaction {
  const from = findAccount(accounts, input.workspaceId, input.fromAccountId);
  const to = findAccount(accounts, input.workspaceId, input.toAccountId);
  requireKind(from, ['asset'], 'A transfer source must be an asset account');
  requireKind(to, ['asset'], 'A transfer destination must be an asset account');
  if (from.id === to.id) throw new RangeError('A transfer requires two different accounts');
  if (from.currency !== to.currency || from.currency !== input.amount.currency) {
    throw new RangeError('Transfers require matching account and transaction currencies');
  }
  return createJournalTransaction(
    {
      ...input,
      kind: 'transfer',
      postings: [
        { accountId: to.id, side: 'debit', amount: input.amount },
        { accountId: from.id, side: 'credit', amount: input.amount },
      ],
    },
    accounts,
  );
}

export function createExpenseRefundTransaction(
  input: JournalInput & {
    readonly amount: Money;
    readonly originalExpense: JournalTransaction;
    readonly expenseAccountId: string;
    readonly refundAccountId: string;
    readonly priorTransactions: readonly JournalTransaction[];
  },
  accounts: readonly Account[],
): JournalTransaction {
  const { originalExpense } = input;
  if (
    originalExpense.workspaceId !== input.workspaceId ||
    originalExpense.kind !== 'expense' ||
    originalExpense.status !== 'posted'
  ) {
    throw new RangeError('A refund must refer to a posted expense in the same workspace');
  }
  const originalAmount = sumPostings(
    originalExpense.postings.filter(
      (posting) => posting.accountId === input.expenseAccountId && posting.side === 'debit',
    ),
    input.amount.currency,
  );
  if (originalAmount === 0n)
    throw new RangeError('Refund account is not part of the original expense');

  const alreadyRefunded = input.priorTransactions
    .filter(
      (transaction) =>
        transaction.workspaceId === input.workspaceId &&
        transaction.kind === 'refund' &&
        transaction.reversalOfId === originalExpense.id,
    )
    .reduce((total, transaction) => {
      if (transaction.workspaceId !== input.workspaceId) {
        throw new RangeError('Refund history must belong to the same workspace');
      }
      return (
        total +
        sumPostings(
          transaction.postings.filter(
            (posting) => posting.accountId === input.expenseAccountId && posting.side === 'credit',
          ),
          input.amount.currency,
        )
      );
    }, 0n);
  assertPositiveMoney(input.amount);
  if (alreadyRefunded + input.amount.amountMinor > originalAmount) {
    throw new RangeError('Refund total cannot exceed the original expense amount');
  }
  if (
    input.priorTransactions.some(
      (transaction) =>
        transaction.workspaceId === input.workspaceId &&
        transaction.kind === 'reversal' &&
        transaction.reversalOfId === originalExpense.id,
    )
  ) {
    throw new RangeError('A reversed transaction cannot also be refunded');
  }

  const expense = findAccount(accounts, input.workspaceId, input.expenseAccountId);
  const refundAccount = findAccount(accounts, input.workspaceId, input.refundAccountId);
  requireKind(expense, ['expense'], 'Refund must reverse an expense account');
  requireKind(
    refundAccount,
    ['asset', 'liability'],
    'Refund proceeds must return to an asset or card-liability account',
  );
  return buildJournalTransaction(
    {
      ...input,
      kind: 'refund',
      reversalOfId: originalExpense.id,
      postings: [
        { accountId: refundAccount.id, side: 'debit', amount: input.amount },
        { accountId: expense.id, side: 'credit', amount: input.amount },
      ],
    },
    accounts,
  );
}

export function createReversalTransaction(
  input: JournalInput & {
    readonly original: JournalTransaction;
    readonly priorTransactions: readonly JournalTransaction[];
  },
  accounts: readonly Account[],
): JournalReversal {
  const { original } = input;
  if (original.workspaceId !== input.workspaceId || original.status !== 'posted') {
    throw new RangeError('Only a posted transaction in the same workspace can be reversed');
  }
  if (
    input.priorTransactions.some(
      (transaction) =>
        transaction.workspaceId === input.workspaceId &&
        transaction.kind === 'reversal' &&
        transaction.reversalOfId === original.id,
    )
  ) {
    throw new RangeError('A transaction can be reversed only once');
  }
  if (
    input.priorTransactions.some(
      (transaction) =>
        transaction.workspaceId === input.workspaceId &&
        transaction.kind === 'refund' &&
        transaction.reversalOfId === original.id,
    )
  ) {
    throw new RangeError('A refunded transaction cannot also be fully reversed');
  }
  const reversal = buildJournalTransaction(
    {
      id: input.id,
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      occurredAt: input.occurredAt,
      description: input.description,
      kind: 'reversal',
      postings: original.postings.map((posting) => ({
        accountId: posting.accountId,
        side: posting.side === 'debit' ? 'credit' : 'debit',
        amount: { amountMinor: posting.amountMinor, currency: posting.currency },
      })),
      reversalOfId: original.id,
    },
    accounts,
  );
  return Object.freeze({
    original: Object.freeze({ ...original, status: 'reversed' }),
    reversal,
  });
}

export function createLoanPaymentTransaction(
  input: JournalInput & {
    readonly principal: Money;
    readonly interest: Money;
    readonly liabilityAccountId: string;
    readonly cashAccountId: string;
    readonly interestAccountId: string;
  },
  accounts: readonly Account[],
): JournalTransaction {
  const liability = findAccount(accounts, input.workspaceId, input.liabilityAccountId);
  const cash = findAccount(accounts, input.workspaceId, input.cashAccountId);
  const interest = findAccount(accounts, input.workspaceId, input.interestAccountId);
  requireKind(liability, ['liability'], 'Loan principal must reduce a liability account');
  requireKind(cash, ['asset'], 'Loan payments must be paid from an asset account');
  requireKind(interest, ['expense'], 'Loan interest must be posted to an expense account');
  assertNonnegativeMoney(input.principal);
  assertNonnegativeMoney(input.interest);
  if (
    input.principal.currency !== input.interest.currency ||
    input.principal.currency !== liability.currency ||
    input.principal.currency !== cash.currency ||
    input.principal.currency !== interest.currency
  ) {
    throw new RangeError('Loan payment accounts and amounts must use one currency');
  }
  const total = addMoney(input.principal, input.interest);
  if (total.amountMinor === 0n) throw new RangeError('Loan payment must be greater than zero');
  const postings: PostingDraft[] = [];
  if (input.principal.amountMinor > 0n) {
    postings.push({ accountId: liability.id, side: 'debit', amount: input.principal });
  }
  if (input.interest.amountMinor > 0n) {
    postings.push({ accountId: interest.id, side: 'debit', amount: input.interest });
  }
  postings.push({ accountId: cash.id, side: 'credit', amount: total });
  return createJournalTransaction({ ...input, kind: 'loan_payment', postings }, accounts);
}

export function createCardSettlementTransaction(
  input: JournalInput & {
    readonly amount: Money;
    readonly cardAccountId: string;
    readonly cashAccountId: string;
  },
  accounts: readonly Account[],
): JournalTransaction {
  const card = findAccount(accounts, input.workspaceId, input.cardAccountId);
  const cash = findAccount(accounts, input.workspaceId, input.cashAccountId);
  requireKind(card, ['liability'], 'A card settlement must reduce a liability account');
  requireKind(cash, ['asset'], 'A card settlement must be paid from an asset account');
  if (card.currency !== cash.currency || card.currency !== input.amount.currency) {
    throw new RangeError('Card settlement accounts and amount must use one currency');
  }
  return createJournalTransaction(
    {
      ...input,
      kind: 'card_settlement',
      postings: [
        { accountId: card.id, side: 'debit', amount: input.amount },
        { accountId: cash.id, side: 'credit', amount: input.amount },
      ],
    },
    accounts,
  );
}

export function getAccountBalance(account: Account, postings: readonly Posting[]): Money {
  let balance: Money = { amountMinor: 0n, currency: account.currency };
  for (const posting of postings) {
    if (posting.accountId !== account.id || posting.workspaceId !== account.workspaceId) continue;
    if (posting.currency !== account.currency) {
      throw new RangeError('Posting currency must match its account currency');
    }
    if (posting.side !== 'debit' && posting.side !== 'credit') {
      throw new TypeError('Posting side must be debit or credit');
    }
    assertPositiveMoney({ amountMinor: posting.amountMinor, currency: posting.currency });
    const debitNormal = account.kind === 'asset' || account.kind === 'expense';
    const increasesBalance = posting.side === 'debit' ? debitNormal : !debitNormal;
    const signedAmount = increasesBalance ? posting.amountMinor : -posting.amountMinor;
    balance = addMoney(balance, { amountMinor: signedAmount, currency: account.currency });
  }
  return balance;
}

function assertJournalInput(input: JournalInput): void {
  for (const [name, value] of Object.entries({
    id: input.id,
    workspaceId: input.workspaceId,
    actorId: input.actorId,
    description: input.description,
  })) {
    if (!value.trim()) throw new TypeError(`${name} must be non-empty`);
  }
  if (!input.occurredAt.endsWith('Z') || Number.isNaN(Date.parse(input.occurredAt))) {
    throw new TypeError('occurredAt must be a valid UTC ISO timestamp');
  }
}

function findAccount(
  accounts: readonly Account[],
  workspaceId: string,
  accountId: string,
): Account {
  const account = accounts.find(
    (candidate) => candidate.id === accountId && candidate.workspaceId === workspaceId,
  );
  if (!account) throw new RangeError('Account does not belong to this workspace');
  return account;
}

function requireKind(account: Account, kinds: readonly AccountKind[], message: string): void {
  if (!kinds.includes(account.kind)) throw new RangeError(message);
}

function assertPositiveMoney(money: Money): void {
  fromJsonMoney({ amountMinor: money.amountMinor.toString(), currency: money.currency });
  if (money.amountMinor <= 0n) throw new RangeError('Posting amounts must be positive');
}

function assertNonnegativeMoney(money: Money): void {
  fromJsonMoney({ amountMinor: money.amountMinor.toString(), currency: money.currency });
  if (money.amountMinor < 0n) throw new RangeError('Loan amounts cannot be negative');
}

function sumPostings(postings: readonly Posting[], currency: CurrencyCode): bigint {
  return postings.reduce((total, posting) => {
    if (posting.currency !== currency) return total;
    const sum = addMoney(
      { amountMinor: total, currency },
      {
        amountMinor: posting.amountMinor,
        currency,
      },
    );
    return sum.amountMinor;
  }, 0n);
}
