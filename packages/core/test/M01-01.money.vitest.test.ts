import { describe, expect, it } from 'vitest';
import {
  addMoney,
  compareMoney,
  convertMinorUnits,
  fromJsonMoney,
  fromMajorDecimal,
  fromSafeMinorNumber,
  formatMajorDecimal,
  getCurrencyScale,
  SQLITE_INT64_MAX,
  SQLITE_INT64_MIN,
  subtractMoney,
  toJsonMoney,
} from '../src/money/index.js';

describe('M01-01 money precision', () => {
  it('converts supported currency decimal scales exactly', () => {
    expect(fromMajorDecimal('1.23', 'CAD')).toEqual({ amountMinor: 123n, currency: 'CAD' });
    expect(fromMajorDecimal('1.23', 'CNY')).toEqual({ amountMinor: 123n, currency: 'CNY' });
    expect(fromMajorDecimal('123', 'JPY')).toEqual({ amountMinor: 123n, currency: 'JPY' });
    expect(getCurrencyScale('JPY')).toBe(0);
    expect(formatMajorDecimal(fromMajorDecimal('-0.05', 'CAD'))).toBe('-0.05');
  });

  it('rejects ambiguous decimal input and excess precision instead of rounding', () => {
    for (const input of [' 1.00', '1e2', '1,000.00', '.50', '01.00', '']) {
      expect(() => fromMajorDecimal(input, 'CAD')).toThrow();
    }
    expect(() => fromMajorDecimal('1.001', 'CAD')).toThrow(/precision/);
    expect(() => fromMajorDecimal('1.0', 'JPY')).toThrow(/precision/);
    expect(() => getCurrencyScale('USD')).toThrow(/Unsupported currency/);
  });

  it('supports same-currency arithmetic and rejects mixed currencies', () => {
    const one = fromMajorDecimal('1.23', 'CAD');
    const half = fromMajorDecimal('0.50', 'CAD');
    expect(addMoney(one, half).amountMinor).toBe(173n);
    expect(subtractMoney(one, half).amountMinor).toBe(73n);
    expect(compareMoney(one, half)).toBe(1);
    expect(() => addMoney(one, fromMajorDecimal('100', 'JPY'))).toThrow(/matching currencies/);
    expect(() => subtractMoney(one, fromMajorDecimal('100', 'JPY'))).toThrow(/matching currencies/);
  });

  it('rounds conversion ties half away from zero deterministically', () => {
    expect(convertMinorUnits(3n, 1n, 2n)).toBe(2n);
    expect(convertMinorUnits(-3n, 1n, 2n)).toBe(-2n);
    expect(convertMinorUnits(1n, 1n, 2n)).toBe(1n);
    expect(convertMinorUnits(-1n, 1n, 2n)).toBe(-1n);
    expect(convertMinorUnits(1n, 1n, 3n)).toBe(0n);
    expect(() => convertMinorUnits(1n, 1n, 0n)).toThrow(/ratio/);
    expect(() => convertMinorUnits(SQLITE_INT64_MAX, 2n, 1n)).toThrow(/64-bit/);
  });

  it('serializes minor units as decimal strings and enforces int64 boundaries', () => {
    const max = fromSafeMinorNumber(Number.MAX_SAFE_INTEGER, 'CAD');
    expect(toJsonMoney(max)).toEqual({ amountMinor: '9007199254740991', currency: 'CAD' });
    expect(fromJsonMoney(toJsonMoney(max))).toEqual(max);
    expect(
      fromJsonMoney({ amountMinor: SQLITE_INT64_MIN.toString(), currency: 'JPY' }).amountMinor,
    ).toBe(SQLITE_INT64_MIN);
    expect(
      fromJsonMoney({ amountMinor: SQLITE_INT64_MAX.toString(), currency: 'CAD' }).amountMinor,
    ).toBe(SQLITE_INT64_MAX);
    expect(() => fromMajorDecimal('92233720368547758.08', 'CAD')).toThrow(/64-bit/);
    expect(() => fromJsonMoney({ amountMinor: '9223372036854775808', currency: 'CAD' })).toThrow(
      /64-bit/,
    );
    expect(() => fromJsonMoney({ amountMinor: 123, currency: 'CAD' })).toThrow();
    expect(() => fromSafeMinorNumber(Number.MAX_SAFE_INTEGER + 1, 'CAD')).toThrow(/safe integer/);
  });
});
