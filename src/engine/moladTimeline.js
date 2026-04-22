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
 * Days-from-epoch of a molad close to the Rambam's epoch.
 *
 * In principle this should be derived from BaHaRaD (KH 6:8) — the
 * Rambam's first molad (Tishrei year 1 AM at day 2, hour 5, parts 204) —
 * by adding the mean synodic month × (number of months from year 1 AM
 * Tishrei to the nearest molad to 3 Nisan 4938). We have NOT yet pinned
 * that derivation to a single absolute-time anchor that matches hebcal's
 * year-1-AM convention (different traditions place Rosh Hashanah of
 * year 1 AM on either Monday or Friday, changing the arithmetic by 4
 * days), so for now this keeps the empirical fiducial that pre-existed
 * the 2026 epoch fix. It is used ONLY to phase the timeline tick marks;
 * calendrical molad calculations should use hebcal's own molad functions.
 *
 * TODO: pin against a modern molad from Rambam KH 6:15 text (molad of
 * Nisan 4938) once we've fetched it, then verify against the empirical
 * value below.
 */
const EPOCH_OFFSET_TO_FIRST_MOLAD = -2.36; // days, empirical; see comment

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
