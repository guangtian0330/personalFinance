import assert from 'node:assert/strict';
import test from 'node:test';
import {
  amountToMinorUnits,
  balancesFromTransactions,
  formatMinorUnits,
  getCompleteTransactionHistory,
} from '../dist/ledger-view.js';

const accounts = [
  { id: 'cash', kind: 'asset', currency: 'CAD' },
  { id: 'card', kind: 'liability', currency: 'CAD' },
  { id: 'food', kind: 'expense', currency: 'CAD' },
  { id: 'salary', kind: 'income', currency: 'CAD' },
  { id: 'yen', kind: 'asset', currency: 'JPY' },
];

function transaction(id, postings, status = 'posted') {
  return { id, status, postings };
}

function posting(accountId, side, amountMinor, currency = 'CAD') {
  return { accountId, side, amount: { amountMinor, currency } };
}

test('M01-05: exact account currency scales parse and format minor units', () => {
  assert.equal(amountToMinorUnits('1234.50', 'CAD'), '123450');
  assert.equal(amountToMinorUnits('1234.5', 'CNY'), '123450');
  assert.equal(amountToMinorUnits('1200', 'JPY'), '1200');
  assert.equal(formatMinorUnits(123450n, 'CAD'), 'CAD 1,234.50');
  assert.equal(formatMinorUnits(1200n, 'JPY'), 'JPY 1,200');
  assert.throws(() => amountToMinorUnits('1.001', 'CAD'), /INVALID_AMOUNT/);
  assert.throws(() => amountToMinorUnits('1.1', 'JPY'), /INVALID_AMOUNT/);
  assert.throws(() => amountToMinorUnits('-1', 'CAD'), /INVALID_AMOUNT/);
});

test('M01-05: displayed balances follow each account normal side and preserve separate currencies', () => {
  const balances = balancesFromTransactions(accounts, [
    transaction('income', [
      posting('cash', 'debit', '10000'),
      posting('salary', 'credit', '10000'),
    ]),
    transaction('cash expense', [
      posting('food', 'debit', '250'),
      posting('cash', 'credit', '250'),
    ]),
    transaction('card purchase', [
      posting('food', 'debit', '500'),
      posting('card', 'credit', '500'),
    ]),
    transaction('opening yen', [posting('yen', 'debit', '1234', 'JPY')]),
  ]);
  assert.equal(balances.get('cash'), 9750n);
  assert.equal(balances.get('food'), 750n);
  assert.equal(balances.get('card'), 500n);
  assert.equal(balances.get('salary'), 10000n);
  assert.equal(formatMinorUnits(balances.get('yen'), 'JPY'), 'JPY 1,234');
});

test('M01-05: all history pages are loaded before a balance is presented', async () => {
  const seen = [];
  const history = await getCompleteTransactionHistory(async (cursor) => {
    seen.push(cursor ?? null);
    if (!cursor) return { items: [{ id: 'newest' }], nextCursor: 'page-2' };
    if (cursor === 'page-2') return { items: [{ id: 'older' }], nextCursor: null };
    assert.fail(`Unexpected cursor: ${cursor}`);
  });
  assert.deepEqual(seen, [null, 'page-2']);
  assert.deepEqual(
    history.map(({ id }) => id),
    ['newest', 'older'],
  );
});
