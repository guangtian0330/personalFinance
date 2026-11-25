import type { AccountResponse, TransactionResponse } from '@finpath/contracts';

const currencyScale = { CAD: 2, CNY: 2, JPY: 0 } as const;

export function amountToMinorUnits(value: string, currency: AccountResponse['currency']): string {
  const scale = currencyScale[currency];
  const match = /^(0|[1-9]\d*)(?:\.(\d*))?$/.exec(value.trim());
  if (!match || (match[2]?.length ?? 0) > scale) throw new Error('INVALID_AMOUNT');
  const fraction = (match[2] ?? '').padEnd(scale, '0');
  return `${BigInt(match[1] ?? '0') * 10n ** BigInt(scale) + BigInt(fraction || '0')}`;
}

export function formatMinorUnits(
  amountMinor: bigint,
  currency: AccountResponse['currency'],
): string {
  const scale = currencyScale[currency];
  const divisor = 10n ** BigInt(scale);
  const absolute = amountMinor < 0n ? -amountMinor : amountMinor;
  const whole = absolute / divisor;
  const fraction = scale ? `.${(absolute % divisor).toString().padStart(scale, '0')}` : '';
  const groupedWhole = new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 }).format(whole);
  const sign = amountMinor < 0n ? '-' : '';
  return `${currency} ${sign}${groupedWhole}${fraction}`;
}

export function balancesFromTransactions(
  accounts: readonly AccountResponse[],
  transactions: readonly TransactionResponse[],
): Map<string, bigint> {
  const balances = new Map(accounts.map((account) => [account.id, 0n]));
  for (const transaction of transactions) {
    for (const posting of transaction.postings) {
      const account = accounts.find((candidate) => candidate.id === posting.accountId);
      if (!account) continue;
      const amount = BigInt(posting.amount.amountMinor);
      const normalDebit = account.kind === 'asset' || account.kind === 'expense';
      const increase = (posting.side === 'debit') === normalDebit;
      balances.set(account.id, (balances.get(account.id) ?? 0n) + (increase ? amount : -amount));
    }
  }
  return balances;
}

export async function getCompleteTransactionHistory(
  getPage: (
    cursor?: string | null,
  ) => Promise<{ items: TransactionResponse[]; nextCursor: string | null }>,
): Promise<TransactionResponse[]> {
  const transactions: TransactionResponse[] = [];
  let cursor: string | null = null;
  do {
    const page = await getPage(cursor);
    transactions.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);
  return transactions;
}

export function localDateTimeValue(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
