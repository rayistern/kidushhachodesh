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
 * Find the molad nearest to the given days-from-epoch value.
 * Returns the days-from-epoch of that molad.
 *
 * Approach: scan a small window of mean moladot around the anchor and
 * return the one closest in time. This is good enough for sub-day
 * accuracy without needing to know the exact epoch molad.
 *
 * For the timeline we just want round-number conjunctions for visual
 * reference, so we use a fiducial: at days=0 (epoch 3 Nisan 4938) the
 * sun is at 0° and the moon is at 31°14'43" — they were not conjunct.
 * The mean conjunction nearest the epoch is therefore at ~ -2.4 days.
 */
const EPOCH_OFFSET_TO_FIRST_MOLAD = -2.36; // approximate, in days

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
