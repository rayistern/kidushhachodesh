/**
 * Period-block decomposition — the Rambam's own method for computing
 * mean motions across large day counts (KH 12:1, 14:2, 14:3, 16:2).
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17)
 *  SURFACE CATEGORY: Rambam-surface (the method itself is his)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Per docs/OPEN_QUESTIONS.md Q4 / Q7: this is the authoritative
 * computational surface for mean longitudes. The Rambam expects the
 * student to decompose N days into blocks of 10,000 / 1,000 / 100 / 10
 * / single days, look up each block's pre-computed motion from his
 * tables, and sum them mod 360.
 *
 * This file provides the pure decomposition helper. Step builders in
 * sunCalculations.js / moonCalculations.js import it and wrap the
 * result in a CalculationStep with the decomposition exposed as the
 * step's `inputs` (so drill-down shows the Rambam's method, not our
 * daily×N shortcut).
 */
import { dmsToDecimal, normalizeDegrees } from './dmsUtils.js';

/**
 * Decompose N into its period-block structure.
 *
 * Returns { k, j, i, h, d } where
 *   N = k × 10000 + j × 1000 + i × 100 + h × 10 + d
 * and d ∈ [0, 9].
 */
export function decomposeDays(days) {
  const n = Math.max(0, Math.floor(days));
  const k = Math.floor(n / 10000);
  const r1 = n - k * 10000;
  const j = Math.floor(r1 / 1000);
  const r2 = r1 - j * 1000;
  const i = Math.floor(r2 / 100);
  const r3 = r2 - i * 100;
  const h = Math.floor(r3 / 10);
  const d = r3 - h * 10;
  return { k, j, i, h, d };
}

/**
 * Sum period-block motions for the given decomposition + remainder
 * daily rate, modulo 360.
 *
 * `blocks` is a constant of the form {p10000, p1000, p100, p10, p29,
 * p354} where each value is a DMS object ({degrees, minutes, seconds}).
 * Only p10000/p1000/p100/p10 are consumed here; the 29/354 values are
 * preserved for alternate decomposition paths (not used in this
 * function).
 *
 * `dailyRate` is a DMS object applied to the single-day remainder
 * (0..9 days). Per KH 12:1, the student multiplies the daily rate by
 * the remainder — he doesn't publish a 1-day table explicitly.
 *
 * `startPosition` is a decimal-degree number added at the end.
 */
export function sumPeriodBlocks(decomposition, blocks, dailyRate, startPosition) {
  const { k, j, i, h, d } = decomposition;
  const v10000 = dmsToDecimal(blocks.p10000);
  const v1000  = dmsToDecimal(blocks.p1000);
  const v100   = dmsToDecimal(blocks.p100);
  const v10    = dmsToDecimal(blocks.p10);
  const vDaily = typeof dailyRate === 'number' ? dailyRate : dmsToDecimal(dailyRate);

  const total = startPosition
    + k * v10000
    + j * v1000
    + i * v100
    + h * v10
    + d * vDaily;

  return {
    result: normalizeDegrees(total),
    contributions: {
      startPosition,
      k,  contrib_k:  k  * v10000,
      j,  contrib_j:  j  * v1000,
      i,  contrib_i:  i  * v100,
      h,  contrib_h:  h  * v10,
      d,  contrib_d:  d  * vDaily,
      block10000: v10000,
      block1000:  v1000,
      block100:   v100,
      block10:    v10,
      dailyRate:  vDaily,
    },
  };
}

/**
 * Convenience: given days + tables + epoch start, return the mean
 * longitude + a structured payload suitable for a CalculationStep's
 * `inputs` field.
 */
export function meanLongitudeByPeriodBlocks(days, blocks, dailyRate, startPosition) {
  const decomp = decomposeDays(days);
  const sum = sumPeriodBlocks(decomp, blocks, dailyRate, startPosition);
  return { ...sum, decomposition: decomp };
}
