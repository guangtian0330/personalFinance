import { describe, expect, it } from 'vitest';
import {
  createCardSettlementTransaction,
  createExpenseRefundTransaction,
  createExpenseTransaction,
  createIncomeTransaction,
  createJournalTransaction,
  createLoanPaymentTransaction,
  createReversalTransaction,
  createTransferTransaction,
  getAccountBalance,
} from '../src/ledger/index.ts';

const accounts = [
  account('checking', 'asset'),
  account('savings', 'asset'),
  account('card', 'liability'),
  account('loan', 'liability'),
  account('salary', 'income'),
  account('groceries', 'expense'),
  account('interest', 'expense'),
  account('yen-cash', 'asset', 'JPY'),
];

function account(id, kind, currency = 'CAD', workspaceId = 'workspace-a') {
  return {
    id,
    workspaceId,
    name: id,
    kind,
    currency,
    liquidityClass: null,
    archivedAt: null,
  };
}

function money(amountMinor, currency = 'CAD') {
  return { amountMinor: BigInt(amountMinor), currency };
}

function input(id) {
  return {
    id,
    workspaceId: 'workspace-a',
    actorId: 'user-a',
    occurredAt: '2026-11-03T12:00:00.000Z',
    description: `Synthetic ${id}`,
  };
}

describe('M01-03 balanced ledger domain', () => {
  it('posts income and expense with account-normal balance signs', () => {
    const income = createIncomeTransaction(
      {
        ...input('income-1'),
        amount: money(10_000),
        cashAccountId: 'checking',
        incomeAccountId: 'salary',
      },
      accounts,
    );
    const expense = createExpenseTransaction(
      {
        ...input('expense-1'),
        amount: money(3_000),
        expenseAccountId: 'groceries',
        paymentAccountId: 'checking',
      },
      accounts,
    );

    expect(income.postings.map(({ side, amountMinor }) => [side, amountMinor])).toEqual([
      ['debit', 10_000n],
      ['credit', 10_000n],
    ]);
    expect(getAccountBalance(accounts[0], income.postings).amountMinor).toBe(10_000n);
    expect(getAccountBalance(accounts[4], income.postings).amountMinor).toBe(10_000n);
    expect(getAccountBalance(accounts[5], expense.postings).amountMinor).toBe(3_000n);
    expect(getAccountBalance(accounts[0], expense.postings).amountMinor).toBe(-3_000n);
  });

  it('posts same-currency transfers only between distinct assets', () => {
    const transfer = createTransferTransaction(
      {
        ...input('transfer-1'),
        amount: money(20_000),
        fromAccountId: 'checking',
        toAccountId: 'savings',
      },
      accounts,
    );
    expect(transfer.kind).toBe('transfer');
    expect(transfer.postings.map(({ side, accountId }) => [side, accountId])).toEqual([
      ['debit', 'savings'],
      ['credit', 'checking'],
    ]);
    expect(
      transfer.postings.some(
        ({ accountId }) => accounts.find((item) => item.id === accountId)?.kind === 'expense',
      ),
    ).toBe(false);
    expect(() =>
      createTransferTransaction(
        {
          ...input('bad-fx'),
          amount: money(100, 'CAD'),
          fromAccountId: 'checking',
          toAccountId: 'yen-cash',
        },
        accounts,
      ),
    ).toThrow(/matching account and transaction currencies/);
  });

  it('rejects one-sided, unbalanced, cross-currency and foreign-workspace journals', () => {
    expect(() =>
      createJournalTransaction(
        {
          ...input('one-sided'),
          kind: 'expense',
          postings: [{ accountId: 'groceries', side: 'debit', amount: money(1) }],
        },
        accounts,
      ),
    ).toThrow(/at least two postings/);
    expect(() =>
      createJournalTransaction(
        {
          ...input('invalid-side'),
          kind: 'expense',
          postings: [
            { accountId: 'groceries', side: 'debit', amount: money(10) },
            { accountId: 'checking', side: 'invalid', amount: money(10) },
          ],
        },
        accounts,
      ),
    ).toThrow(/side must be debit or credit/);
    expect(() =>
      createJournalTransaction(
        {
          ...input('unbalanced'),
          kind: 'expense',
          postings: [
            { accountId: 'groceries', side: 'debit', amount: money(100) },
            { accountId: 'checking', side: 'credit', amount: money(99) },
          ],
        },
        accounts,
      ),
    ).toThrow(/not balanced in CAD/);
    expect(() =>
      createJournalTransaction(
        {
          ...input('cross-currency'),
          kind: 'transfer',
          postings: [
            { accountId: 'checking', side: 'debit', amount: money(100, 'CAD') },
            { accountId: 'yen-cash', side: 'credit', amount: money(100, 'JPY') },
          ],
        },
        accounts,
      ),
    ).toThrow(/not balanced in CAD/);
    expect(() =>
      createExpenseTransaction(
        {
          ...input('foreign-account'),
          amount: money(100),
          expenseAccountId: 'groceries',
          paymentAccountId: 'other-checking',
        },
        accounts,
      ),
    ).toThrow(/does not belong to this workspace/);
  });

  it('links partial refunds to the expense and prevents refunding more than the remaining amount', () => {
    const expense = createExpenseTransaction(
      {
        ...input('expense-120'),
        amount: money(12_000),
        expenseAccountId: 'groceries',
        paymentAccountId: 'checking',
      },
      accounts,
    );
    const refund = createExpenseRefundTransaction(
      {
        ...input('refund-20'),
        amount: money(2_000),
        originalExpense: expense,
        expenseAccountId: 'groceries',
        refundAccountId: 'checking',
        priorTransactions: [expense],
      },
      accounts,
    );
    expect(refund.reversalOfId).toBe(expense.id);
    expect(
      getAccountBalance(accounts[5], [...expense.postings, ...refund.postings]).amountMinor,
    ).toBe(10_000n);
    expect(() =>
      createExpenseRefundTransaction(
        {
          ...input('refund-too-much'),
          amount: money(10_001),
          originalExpense: expense,
          expenseAccountId: 'groceries',
          refundAccountId: 'checking',
          priorTransactions: [expense, refund],
        },
        accounts,
      ),
    ).toThrow(/cannot exceed/);
  });

  it('creates an exact linked reversal and rejects duplicate or refund-conflicting reversals', () => {
    const expense = createExpenseTransaction(
      {
        ...input('expense-to-reverse'),
        amount: money(4_000),
        expenseAccountId: 'groceries',
        paymentAccountId: 'checking',
      },
      accounts,
    );
    const reversalResult = createReversalTransaction(
      { ...input('reversal-1'), original: expense, priorTransactions: [expense] },
      accounts,
    );
    const reversal = reversalResult.reversal;
    expect(reversal.reversalOfId).toBe(expense.id);
    expect(reversalResult.original.status).toBe('reversed');
    expect(expense.status).toBe('posted');
    expect(
      reversal.postings.map(({ accountId, side, amountMinor }) => [accountId, side, amountMinor]),
    ).toEqual(
      expense.postings.map(({ accountId, side, amountMinor }) => [
        accountId,
        side === 'debit' ? 'credit' : 'debit',
        amountMinor,
      ]),
    );
    expect(() =>
      createReversalTransaction(
        { ...input('reversal-2'), original: expense, priorTransactions: [expense, reversal] },
        accounts,
      ),
    ).toThrow(/only once/);

    const refund = createExpenseRefundTransaction(
      {
        ...input('refund-first'),
        amount: money(500),
        originalExpense: expense,
        expenseAccountId: 'groceries',
        refundAccountId: 'checking',
        priorTransactions: [expense],
      },
      accounts,
    );
    expect(() =>
      createReversalTransaction(
        {
          ...input('reversal-after-refund'),
          original: expense,
          priorTransactions: [expense, refund],
        },
        accounts,
      ),
    ).toThrow(/refunded transaction/);
    expect(() =>
      createExpenseRefundTransaction(
        {
          ...input('refund-after-reversal'),
          amount: money(500),
          originalExpense: expense,
          expenseAccountId: 'groceries',
          refundAccountId: 'checking',
          priorTransactions: [expense, reversal],
        },
        accounts,
      ),
    ).toThrow(/reversed transaction/);
  });

  it('separates loan principal from interest and card purchase from settlement', () => {
    const payment = createLoanPaymentTransaction(
      {
        ...input('loan-payment'),
        principal: money(45_000),
        interest: money(5_000),
        liabilityAccountId: 'loan',
        cashAccountId: 'checking',
        interestAccountId: 'interest',
      },
      accounts,
    );
    expect(getAccountBalance(accounts[3], payment.postings).amountMinor).toBe(-45_000n);
    expect(getAccountBalance(accounts[6], payment.postings).amountMinor).toBe(5_000n);
    expect(getAccountBalance(accounts[0], payment.postings).amountMinor).toBe(-50_000n);

    const cardPurchase = createExpenseTransaction(
      {
        ...input('card-purchase'),
        amount: money(4_000),
        expenseAccountId: 'groceries',
        paymentAccountId: 'card',
      },
      accounts,
    );
    const settlement = createCardSettlementTransaction(
      {
        ...input('card-settlement'),
        amount: money(4_000),
        cardAccountId: 'card',
        cashAccountId: 'checking',
      },
      accounts,
    );
    expect(cardPurchase.kind).toBe('expense');
    expect(
      getAccountBalance(accounts[2], [...cardPurchase.postings, ...settlement.postings])
        .amountMinor,
    ).toBe(0n);
    expect(
      getAccountBalance(accounts[5], [...cardPurchase.postings, ...settlement.postings])
        .amountMinor,
    ).toBe(4_000n);
  });

  it('supports exact int64 posting amounts and rejects zero, negative and overflow amounts', () => {
    const max = (1n << 63n) - 1n;
    const large = createIncomeTransaction(
      {
        ...input('max-int64'),
        amount: money(max),
        cashAccountId: 'checking',
        incomeAccountId: 'salary',
      },
      accounts,
    );
    expect(large.postings[0].amountMinor).toBe(max);
    for (const amount of [0n, -1n, max + 1n]) {
      expect(() =>
        createIncomeTransaction(
          {
            ...input(`bad-${amount}`),
            amount: money(amount),
            cashAccountId: 'checking',
            incomeAccountId: 'salary',
          },
          accounts,
        ),
      ).toThrow();
    }
  });

  it('scopes accounts and generated posting IDs when tenant transaction IDs match', () => {
    const workspaceBAccounts = [
      ...accounts,
      account('checking', 'asset', 'CAD', 'workspace-b'),
      account('salary', 'income', 'CAD', 'workspace-b'),
    ];
    const transactionA = createIncomeTransaction(
      {
        ...input('same-id'),
        amount: money(100),
        cashAccountId: 'checking',
        incomeAccountId: 'salary',
      },
      accounts,
    );
    const transactionB = createIncomeTransaction(
      {
        ...input('same-id'),
        workspaceId: 'workspace-b',
        actorId: 'user-b',
        amount: money(100),
        cashAccountId: 'checking',
        incomeAccountId: 'salary',
      },
      workspaceBAccounts,
    );
    expect(transactionA.postings.map(({ id }) => id)).not.toEqual(
      transactionB.postings.map(({ id }) => id),
    );
    expect(transactionB.postings.every(({ workspaceId }) => workspaceId === 'workspace-b')).toBe(
      true,
    );
  });

  it('replays the same command deterministically and keeps native currencies separate', () => {
    const command = {
      ...input('stable-income'),
      amount: money(123, 'JPY'),
      cashAccountId: 'yen-cash',
      incomeAccountId: 'salary',
    };
    const yenAccounts = [...accounts, account('yen-salary', 'income', 'JPY')];
    const yenCommand = { ...command, incomeAccountId: 'yen-salary' };
    expect(createIncomeTransaction(yenCommand, yenAccounts)).toEqual(
      createIncomeTransaction(yenCommand, yenAccounts),
    );
    expect(
      getAccountBalance(yenAccounts[7], createIncomeTransaction(yenCommand, yenAccounts).postings),
    ).toEqual({ amountMinor: 123n, currency: 'JPY' });
  });
});
