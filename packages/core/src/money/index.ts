export type CurrencyCode = 'CAD' | 'CNY' | 'JPY';

export interface Money {
  readonly amountMinor: bigint;
  readonly currency: CurrencyCode;
}

export interface JsonMoney {
  readonly amountMinor: string;
  readonly currency: CurrencyCode;
}

const CURRENCY_SCALES: Readonly<Record<CurrencyCode, number>> = {
  CAD: 2,
  CNY: 2,
  JPY: 0,
};

export const SQLITE_INT64_MIN = -(1n << 63n);
export const SQLITE_INT64_MAX = (1n << 63n) - 1n;

export function getCurrencyScale(currency: string): number {
  if (!Object.hasOwn(CURRENCY_SCALES, currency)) {
    throw new RangeError(`Unsupported currency: ${currency}`);
  }
  const scale = CURRENCY_SCALES[currency as CurrencyCode];
  if (scale === undefined) throw new RangeError(`Unsupported currency: ${currency}`);
  return scale;
}

export function fromMajorDecimal(value: string, currency: CurrencyCode): Money {
  const scale = getCurrencyScale(currency);
  const match = /^([+-]?)(0|[1-9]\d*)(?:\.(\d+))?$/.exec(value);
  if (!match) throw new TypeError('Amount must be a plain decimal string');

  const fraction = match[3] ?? '';
  const wholeDigits = match[2];
  if (wholeDigits === undefined) throw new TypeError('Amount must be a plain decimal string');
  if (fraction.length > scale) {
    throw new RangeError(`Amount exceeds ${currency} precision (${scale} decimals)`);
  }

  const factor = 10n ** BigInt(scale);
  const whole = BigInt(wholeDigits);
  const minorFraction = fraction.length === 0 ? 0n : BigInt(fraction.padEnd(scale, '0'));
  const magnitude = whole * factor + minorFraction;
  const amountMinor = match[1] === '-' ? -magnitude : magnitude;
  return createMoney(amountMinor, currency);
}

export function fromSafeMinorNumber(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isSafeInteger(amountMinor)) {
    throw new RangeError('Minor-unit number must be a safe integer');
  }
  return createMoney(BigInt(amountMinor), currency);
}

export function formatMajorDecimal(money: Money): string {
  assertMoney(money);
  const scale = getCurrencyScale(money.currency);
  const negative = money.amountMinor < 0n;
  const magnitude = negative ? -money.amountMinor : money.amountMinor;
  if (scale === 0) return `${negative ? '-' : ''}${magnitude}`;

  const factor = 10n ** BigInt(scale);
  const whole = magnitude / factor;
  const fraction = (magnitude % factor).toString().padStart(scale, '0');
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

export function addMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  return createMoney(left.amountMinor + right.amountMinor, left.currency);
}

export function subtractMoney(left: Money, right: Money): Money {
  assertSameCurrency(left, right);
  return createMoney(left.amountMinor - right.amountMinor, left.currency);
}

export function compareMoney(left: Money, right: Money): -1 | 0 | 1 {
  assertSameCurrency(left, right);
  return left.amountMinor < right.amountMinor ? -1 : left.amountMinor > right.amountMinor ? 1 : 0;
}

export function convertMinorUnits(
  amountMinor: bigint,
  numerator: bigint,
  denominator: bigint,
): bigint {
  if (denominator <= 0n || numerator < 0n) {
    throw new RangeError(
      'Conversion ratio must have a nonnegative numerator and positive denominator',
    );
  }
  const product = amountMinor * numerator;
  const negative = product < 0n;
  const magnitude = negative ? -product : product;
  const quotient = magnitude / denominator;
  const remainder = magnitude % denominator;
  const rounded = remainder * 2n >= denominator ? quotient + 1n : quotient;
  return assertInt64(negative ? -rounded : rounded);
}

export function toJsonMoney(money: Money): JsonMoney {
  assertMoney(money);
  return { amountMinor: money.amountMinor.toString(), currency: money.currency };
}

export function fromJsonMoney(value: unknown): Money {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Money JSON must be an object');
  }
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length !== 2 ||
    typeof record.amountMinor !== 'string' ||
    !/^-?(0|[1-9]\d*)$/.test(record.amountMinor) ||
    typeof record.currency !== 'string'
  ) {
    throw new TypeError('Money JSON must contain only integer-string amountMinor and currency');
  }
  const currency = record.currency;
  getCurrencyScale(currency);
  return createMoney(BigInt(record.amountMinor), currency as CurrencyCode);
}

function createMoney(amountMinor: bigint, currency: CurrencyCode): Money {
  getCurrencyScale(currency);
  assertInt64(amountMinor);
  return Object.freeze({ amountMinor, currency });
}

function assertInt64(amountMinor: bigint): bigint {
  if (amountMinor < SQLITE_INT64_MIN || amountMinor > SQLITE_INT64_MAX) {
    throw new RangeError('Money amount exceeds SQLite signed 64-bit integer range');
  }
  return amountMinor;
}

function assertMoney(money: Money): void {
  if (typeof money.amountMinor !== 'bigint') {
    throw new TypeError('Money amountMinor must be a bigint');
  }
  createMoney(money.amountMinor, money.currency);
}

function assertSameCurrency(left: Money, right: Money): void {
  assertMoney(left);
  assertMoney(right);
  if (left.currency !== right.currency) {
    throw new RangeError('Money operations require matching currencies');
  }
}
