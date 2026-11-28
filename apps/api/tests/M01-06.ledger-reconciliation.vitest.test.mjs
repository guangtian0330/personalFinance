import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  addMoney,
  createCardSettlementTransaction,
  createExpenseRefundTransaction,
  createJournalTransaction,
  createLoanPaymentTransaction,
  createReversalTransaction,
  fromJsonMoney,
  getAccountBalance,
} from '@finpath/core';
import { openLocalLedger } from '@finpath/persistence/local-sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/index.ts';

const workspaceId = 'synthetic-local-workspace';
const actorId = 'synthetic-local-developer';
const checking = 'demo-checking-cad';
const savings = 'demo-savings-cad';
const card = 'demo-card-cad';
const groceries = 'demo-food-cad';
const equity = 'demo-opening-equity-cad';
const loan = 'fixture-loan-cad';
const interest = 'fixture-interest-cad';
const yen = 'fixture-cash-jpy';
const yenEquity = 'fixture-equity-jpy';
const transactionsPath = 'http://127.0.0.1:8787/api/v1/private/transactions';
const localAuth = {
  runtime: 'local-node',
  appEnv: 'development',
  nodeEnv: 'development',
  mockAuth: 'true',
};

function money(amountMinor, currency = 'CAD') {
  return { amountMinor, currency };
}

function journalInput(id, day) {
  return {
    id,
    workspaceId,
    actorId,
    occurredAt: `2026-11-${day}T12:00:00.000Z`,
    description: `Synthetic ${id}`,
  };
}

function posting(accountId, side, amountMinor, currency = 'CAD') {
  return { accountId, side, amount: money(amountMinor, currency) };
}

describe('M01-06 SQLite ledger reconciliation', () => {
  let directory;
  let databasePath;
  let store;
  let app;
  let accounts;

  function open() {
    store = openLocalLedger({ databasePath, seedDemoWorkspace: true });
    app = createApp(localAuth, { ledger: store.ledger });
  }

  beforeEach(async () => {
    directory = mkdtempSync(join(tmpdir(), 'finpath-m01-06-'));
    databasePath = join(directory, 'ledger.sqlite3');
    open();
    const database = new DatabaseSync(databasePath);
    try {
      const insert = database.prepare(
        'INSERT INTO accounts (id, workspace_id, name, account_kind, currency) VALUES (?, ?, ?, ?, ?)',
      );
      for (const [id, kind, currency] of [
        [loan, 'liability', 'CAD'],
        [interest, 'expense', 'CAD'],
        [yen, 'asset', 'JPY'],
        [yenEquity, 'equity', 'JPY'],
      ]) {
        insert.run(id, workspaceId, id, kind, currency);
      }
    } finally {
      database.close();
    }
    accounts = await store.ledger.listAccounts(workspaceId);
  });

  afterEach(() => {
    store?.close();
    store = undefined;
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  // Opening, refund, settlement, repayment and reversal use the existing domain
  // and repository interfaces. HTTP currently creates income, expense and transfer.
  async function persist(transaction) {
    await store.ledger.createAtomically(transaction, transaction.id, 'synthetic-fixture');
  }

  function post(key, body) {
    return app.request(transactionsPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify(body),
    });
  }

  async function accepted(response) {
    expect(response.status).toBe(201);
    return response.json();
  }

  async function replay() {
    const response = await app.request(`${transactionsPath}?pageSize=100`);
    expect(response.status).toBe(200);
    const { items, nextCursor } = await response.json();
    expect(nextCursor).toBeNull();
    const postings = items.flatMap((transaction) => {
      const totals = new Map();
      const entries = transaction.postings.map(({ accountId, side, amount }) => {
        const { amountMinor, currency } = fromJsonMoney(amount);
        expect(amountMinor).toBeGreaterThan(0n);
        expect(accounts.find(({ id }) => id === accountId)?.currency).toBe(currency);
        const total = totals.get(currency) ?? 0n;
        totals.set(currency, total + (side === 'debit' ? amountMinor : -amountMinor));
        return { workspaceId, accountId, side, amountMinor, currency };
      });
      expect([...totals.values()]).toEqual([...totals.keys()].map(() => 0n));
      return entries;
    });

    const balances = Object.fromEntries(
      accounts.map((account) => [account.id, getAccountBalance(account, postings)]),
    );
    const netWorth = {};
    for (const { id, currency, kind } of accounts) {
      if (kind !== 'asset' && kind !== 'liability') continue;
      const { amountMinor } = balances[id];
      netWorth[currency] = addMoney(
        netWorth[currency] ?? money(0n, currency),
        money(kind === 'asset' ? amountMinor : -amountMinor, currency),
      );
    }
    return { items, balances, netWorth };
  }

  it('reconciles the IT-001 ledger subset by native currency after reopening SQLite', async () => {
    // CAD checking 10,000, loan 1,000 and JPY cash 100 each have a matched
    // equity posting. Every other account opens at zero, including the card.
    const openingInput = {
      ...journalInput('opening', '01'),
      kind: 'opening_balance',
      postings: [
        posting(checking, 'debit', 1_000_000n),
        posting(equity, 'credit', 1_000_000n),
        posting(equity, 'debit', 100_000n),
        posting(loan, 'credit', 100_000n),
        posting(yen, 'debit', 100n, 'JPY'),
        posting(yenEquity, 'credit', 100n, 'JPY'),
      ],
    };
    expect(() =>
      createJournalTransaction(
        {
          ...openingInput,
          postings: openingInput.postings.filter(({ accountId }) => accountId !== loan),
        },
        accounts,
      ),
    ).toThrow(/not balanced in CAD/);
    await persist(createJournalTransaction(openingInput, accounts));
    const opening = await replay();
    expect(opening.balances).toEqual({
      [checking]: money(1_000_000n),
      [savings]: money(0n),
      [card]: money(0n),
      [loan]: money(100_000n),
      [groceries]: money(0n),
      [interest]: money(0n),
      [equity]: money(900_000n),
      'demo-salary-cad': money(0n),
      [yen]: money(100n, 'JPY'),
      [yenEquity]: money(100n, 'JPY'),
    });
    expect(opening.netWorth).toEqual({
      CAD: money(900_000n),
      JPY: money(100n, 'JPY'),
    });

    const purchase = await accepted(
      await post('groceries', {
        kind: 'expense',
        occurredAt: journalInput('groceries', '02').occurredAt,
        description: 'Synthetic card groceries',
        amount: { amountMinor: '30000', currency: 'CAD' },
        paymentAccountId: card,
        expenseAccountId: groceries,
      }),
    );
    const afterPurchase = await replay();
    expect(afterPurchase.balances[card]).toEqual(money(30_000n));
    expect(afterPurchase.balances[groceries]).toEqual(money(30_000n));
    expect(afterPurchase.netWorth.CAD).toEqual(money(870_000n));

    const transfer = {
      kind: 'transfer',
      occurredAt: journalInput('transfer', '03').occurredAt,
      description: 'Synthetic savings transfer',
      amount: { amountMinor: '200000', currency: 'CAD' },
      fromAccountId: checking,
      toAccountId: savings,
    };
    const submissions = await Promise.all([
      post('savings-transfer', transfer),
      post('savings-transfer', transfer),
    ]);
    const [first, duplicate] = await Promise.all(submissions.map(accepted));
    expect(duplicate).toEqual(first);
    const afterTransfer = await replay();
    expect(afterTransfer.items).toHaveLength(3);
    expect(afterTransfer.netWorth).toEqual(afterPurchase.netWorth);
    expect(afterTransfer.balances[groceries]).toEqual(afterPurchase.balances[groceries]);

    const originalExpense = await store.ledger.getTransaction(workspaceId, purchase.id);
    await persist(
      createExpenseRefundTransaction(
        {
          ...journalInput('refund', '04'),
          amount: money(3_000n),
          originalExpense,
          expenseAccountId: groceries,
          refundAccountId: card,
          priorTransactions: [originalExpense],
        },
        accounts,
      ),
    );
    const afterRefund = await replay();
    expect(afterRefund.items[0].reversalOfId).toBe(purchase.id);
    expect(afterRefund.balances[groceries]).toEqual(money(27_000n));
    expect(afterRefund.balances[card]).toEqual(money(27_000n));
    expect(afterRefund.netWorth.CAD).toEqual(money(873_000n));

    await persist(
      createCardSettlementTransaction(
        {
          ...journalInput('settlement', '05'),
          amount: money(10_000n),
          cardAccountId: card,
          cashAccountId: checking,
        },
        accounts,
      ),
    );
    const afterSettlement = await replay();
    expect(afterSettlement.balances[card]).toEqual(money(17_000n));
    expect(afterSettlement.balances[groceries]).toEqual(afterRefund.balances[groceries]);
    expect(afterSettlement.netWorth).toEqual(afterRefund.netWorth);

    const repayment = createLoanPaymentTransaction(
      {
        ...journalInput('loan-payment', '06'),
        principal: money(45_000n),
        interest: money(5_000n),
        liabilityAccountId: loan,
        cashAccountId: checking,
        interestAccountId: interest,
      },
      accounts,
    );
    await persist(repayment);
    const afterRepayment = await replay();
    expect(afterRepayment.balances[loan]).toEqual(money(55_000n));
    expect(afterRepayment.balances[interest]).toEqual(money(5_000n));
    expect(afterRepayment.netWorth.CAD).toEqual(money(868_000n));

    const { reversal } = createReversalTransaction(
      {
        ...journalInput('reversal', '07'),
        original: await store.ledger.getTransaction(workspaceId, repayment.id),
        priorTransactions: [repayment],
      },
      accounts,
    );
    await persist(reversal);
    store.close();
    store = undefined;
    open();

    // FX execution is deferred. Net worth remains denominated in each native currency.
    const invalidTransfer = await post('fx-transfer', { ...transfer, toAccountId: yen });
    expect(invalidTransfer.status).toBe(422);
    expect(await accepted(await post('savings-transfer', transfer))).toEqual(first);
    const changedAmount = await post('savings-transfer', {
      ...transfer,
      amount: { amountMinor: '200001', currency: 'CAD' },
    });
    expect(changedAmount.status).toBe(409);
    const final = await replay();
    expect(final.items).toHaveLength(7);
    expect(final.items[0]).toMatchObject({ id: reversal.id, reversalOfId: repayment.id });
    expect(final.items[1]).toMatchObject({
      id: repayment.id,
      postings: afterRepayment.items[0].postings,
    });
    expect(final.balances).toEqual(afterSettlement.balances);
    expect(final.balances[checking]).toEqual(money(790_000n));
    expect(final.balances[savings]).toEqual(money(200_000n));
    expect(final.netWorth).toEqual({ CAD: money(873_000n), JPY: money(100n, 'JPY') });
    expect(() => addMoney(final.netWorth.CAD, final.netWorth.JPY)).toThrow(/matching currencies/);
  });

  it('preserves the maximum signed SQLite integer over HTTP and rejects invalid amounts atomically', async () => {
    const income = {
      kind: 'income',
      occurredAt: journalInput('precision', '01').occurredAt,
      description: 'Synthetic precision boundary',
      cashAccountId: checking,
      incomeAccountId: 'demo-salary-cad',
    };
    const maximum = '9223372036854775807';
    const saved = await accepted(
      await post('exact-int64', { ...income, amount: { amountMinor: maximum, currency: 'CAD' } }),
    );
    expect(saved.postings.map(({ amount }) => amount.amountMinor)).toEqual([maximum, maximum]);

    for (const [key, amountMinor, status] of [
      ['overflow', '9223372036854775808', 422],
      ['fractional', '1.5', 400],
      ['zero', '0', 422],
    ]) {
      const response = await post(key, { ...income, amount: { amountMinor, currency: 'CAD' } });
      expect(response.status).toBe(status);
    }
    const result = await replay();
    expect(result.items).toEqual([saved]);
    expect(result.netWorth.CAD).toEqual(money(BigInt(maximum)));
  });
});
