/**
 * Molad timeline helper — computes a sequence of mean moladot (molados)
 * around a given anchor date.
 *
 * The mean molad interval is fixed at 29 days, 12 hours, 793 parts:
 * 29 + 12/24 + 793/(24*1080) ≈ 29.530594 days. This is the Rambam's
 * value (KH 6:3) and matches modern measurements to within ~0.5 seconds.
 *
 * The "true" molad (actual conjunction) differs from the mean molad by
 * up to about 14 hours due to the eccentricity of both orbits — visible
 * as the difference between the dashed and solid markers on the
 * EclipticRibbon when the moon catches up to the sun.
 */
import { liveAll } from './liveLongitudes.js';

const MOLAD_INTERVAL_DAYS = 29 + 12 / 24 + 793 / (24 * 1080); // ~29.530594

/**
 * Days-from-epoch of the mean molad of Nisan 4938 (the molad nearest the
 * Rambam's epoch). Derived from BaHaRaD (KH 6:8) by counting mean moladot.
 *
 * Derivation:
 *   - BaHaRaD = molad Tishrei year 1 AM, day 2 (Monday), 5h 204p past
 *     start-of-Hebrew-day (6 PM civil). That's 5h + 204/1080 h = 5.189h
 *     past Sunday 6 PM = Sunday 11:11:20 PM civil = Monday abs − 49/1440.
 *   - hebcal's HDate(1,'Tishrei',1).abs() returns the abs-day of BaHaRaD's
 *     Monday (verified via abs mod 7 = 1 under Rata Die). hebcal's greg()
 *     reports Friday for this abs, but the JS-Date conversion is unreliable
 *     at year −4264; abs mod 7 is authoritative.
 *   - BaHaRaD abs ≈ −1373427.034.
 *   - Months from BaHaRaD to molad Nisan 4938: 61069 (counting 13 months
 *     for leap cycle positions 3,6,8,11,14,17,19 and 12 otherwise, plus
 *     Tishrei..Adar II inside leap year 4938 itself).
 *   - molad Nisan 4938 abs = −1373427.034 + 61069 × MOLAD_INTERVAL_DAYS.
 *   - Epoch (start of Rambam's day 0 = 6 PM before 3 Nisan 4938) abs
 *     = HDate(3,'Nisan',4938).abs() − 0.25 = 429978.75.
 *   - Offset = molad_abs − epoch_abs ≈ −1.93.
 *
 * Cross-check: the same formula gives molad Nisan 5786 within ~2 hours of
 * the published contemporary value (Jerusalem mean time conversion aside),
 * and within expected mean-vs-true-conjunction drift (up to ±14h) of the
 * actual astronomical new moon on 19 March 2026.
 */
const EPOCH_OFFSET_TO_FIRST_MOLAD = -1.9307; // days, derived from BaHaRaD

/**
 * Returns an array of moladot in [anchorDays - count*interval, anchorDays + count*interval].
 * Each entry is { daysFromEpoch, index } where index 0 is the molad
 * nearest the anchor.
 */
export function moladsAround(anchorDays, count = 6) {
  // Find the integer molad-index closest to the anchor
  const offset = anchorDays - EPOCH_OFFSET_TO_FIRST_MOLAD;
  const nearestIdx = Math.round(offset / MOLAD_INTERVAL_DAYS);

  const out = [];
  for (let i = -count; i <= count; i++) {
    const idx = nearestIdx + i;
    const days = EPOCH_OFFSET_TO_FIRST_MOLAD + idx * MOLAD_INTERVAL_DAYS;
    out.push({ daysFromEpoch: days, index: i });
  }
  return out;
}

/**
 * For a given molad days-from-epoch, find the nearest TRUE conjunction
 * (when the moon's true longitude actually equals the sun's true
 * longitude). We do this by sampling +/- 18 hours and finding the
 * minimum |moonLon - sunLon|.
 */
export function findTrueConjunction(meanMoladDays) {
  let best = { days: meanMoladDays, gap: Infinity };
  // Sample every 30 minutes for ±18 hours
  for (let h = -18; h <= 18; h += 0.5) {
    const d = meanMoladDays + h / 24;
    const live = liveAll(d);
    let gap = Math.abs(live.moon.trueLongitude - live.sun.trueLongitude);
    if (gap > 180) gap = 360 - gap;
    if (gap < best.gap) {
      best = { days: d, gap };
    }
  }
  return best.days;
}

export { MOLAD_INTERVAL_DAYS };
