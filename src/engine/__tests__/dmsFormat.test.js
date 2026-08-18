/**
 * formatDms display rounding — the 60.0″ bug.
 *
 * A reader saw "38° 17′ 60.0″" on a slider. 38.3 in floating point sits
 * a hair under 38°18′; the old code floored the minutes, rounded the
 * leftover seconds to one decimal, and got 60.0 with nothing carrying.
 * The fix rounds to the displayed precision FIRST and then splits, so a
 * carry can never be needed. formatDms is the display path for every
 * number in the app, which is why this lives with the engine tests.
 */
import { describe, it, expect } from 'vitest';
import { formatDms } from '../dmsUtils';

describe('formatDms never shows 60 in any place', () => {
  it('fixes the reported case', () => {
    expect(formatDms(38.3)).toBe('38° 18′ 0.0″');
  });

  it('carries through minutes into degrees', () => {
    expect(formatDms(38.999999999)).toBe('39° 0′ 0.0″');
    expect(formatDms(359.9999999)).toBe('360° 0′ 0.0″');
  });

  it('holds across a brute sweep of awkward values', () => {
    for (let i = 0; i < 3600; i++) {
      const value = i / 10 + 0.0499999999; // park just under a tenth boundary
      const out = formatDms(value);
      expect(out, `${value}`).not.toMatch(/60\.0″/);
      expect(out, `${value}`).not.toMatch(/ 60′/);
    }
  });

  it('still formats ordinary values as before', () => {
    expect(formatDms(0)).toBe('0° 0′ 0.0″');
    expect(formatDms(104 + 59 / 60 + 25 / 3600)).toBe('104° 59′ 25.0″');
    expect(formatDms(-3.5)).toBe('-3° 30′ 0.0″');
  });
});

/**
 * decimalToDms — the same carry bug one layer down (2026-08-18
 * integration review of PR #47). This function is a served engine
 * export (/engine/dmsUtils.js) that external consumers format from;
 * it rounded seconds AFTER the split, so a value a hair under a
 * minute boundary returned seconds: 60.
 */
import { decimalToDms } from '../dmsUtils';

describe('decimalToDms never returns 60 seconds', () => {
  it('carries at the minute boundary instead of returning 60', () => {
    // 38°17′59.99964″ — rounds to 60.000 at 3 decimals under the old code.
    const nearMinute = 38 + 17 / 60 + 59.99964 / 3600;
    expect(decimalToDms(nearMinute)).toEqual({ degrees: 38, minutes: 18, seconds: 0 });
  });

  it('carries through minutes into degrees', () => {
    expect(decimalToDms(38.999999999)).toEqual({ degrees: 39, minutes: 0, seconds: 0 });
  });

  it('still splits ordinary values as before', () => {
    expect(decimalToDms(104 + 59 / 60 + 25 / 3600)).toEqual({
      degrees: 104,
      minutes: 59,
      seconds: 25,
    });
    expect(decimalToDms(-3.5)).toEqual({ degrees: -3, minutes: 30, seconds: 0 });
    expect(decimalToDms(0)).toEqual({ degrees: 0, minutes: 0, seconds: 0 });
  });

  it('round-trips against dmsToDecimal within a milliarcsecond-of-second', () => {
    for (let i = 0; i < 360; i++) {
      const value = i + (i % 60) / 60 + ((i * 7) % 60) / 3600 + 0.000013888;
      const dms = decimalToDms(value);
      const back = dms.degrees + dms.minutes / 60 + dms.seconds / 3600;
      expect(Math.abs(back - value)).toBeLessThan(0.0000002);
    }
  });
});
