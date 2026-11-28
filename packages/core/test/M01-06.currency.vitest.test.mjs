import { describe, expect, it } from 'vitest';
import { convertMinorUnits, fromMajorDecimal } from '../src/money/index.ts';

describe('M01-06 currency precision and conversion boundaries', () => {
  it('preserves CAD cents and rejects fractional JPY and excess CAD precision', () => {
    expect(fromMajorDecimal('100.01', 'CAD')).toEqual({ amountMinor: 10_001n, currency: 'CAD' });
    expect(fromMajorDecimal('100', 'JPY')).toEqual({ amountMinor: 100n, currency: 'JPY' });
    expect(() => fromMajorDecimal('100.01', 'JPY')).toThrow(/JPY precision/);
    expect(() => fromMajorDecimal('100.001', 'CAD')).toThrow(/CAD precision/);
  });

  it('uses an explicit synthetic minor-unit ratio and checks rounding and overflow', () => {
    // A synthetic ratio of 3 CAD cents per 2 yen. This exercises arithmetic only.
    expect(convertMinorUnits(3n, 3n, 2n)).toBe(5n);
    expect(convertMinorUnits(-3n, 3n, 2n)).toBe(-5n);
    expect(() => convertMinorUnits(3n, 3n, 0n)).toThrow(/positive denominator/);
    expect(() => convertMinorUnits(9_223_372_036_854_775_807n, 2n, 1n)).toThrow(/64-bit/);
  });
});
