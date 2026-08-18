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
