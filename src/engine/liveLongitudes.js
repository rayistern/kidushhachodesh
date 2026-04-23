/**
 * Live longitude helpers — compute celestial positions every animation
 * frame WITHOUT routing through the full calculation pipeline.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17 fast path)
 *  SURFACE CATEGORY: internal utility
 * ═══════════════════════════════════════════════════════════════════
 * Mirrors the mean-motion arithmetic of the full pipeline, for
 * animation-frame performance. No fixed-calendar dependency.
 * See docs/OPEN_QUESTIONS.md Q2.
 *
 * The pipeline is for the calendar-date snapshot shown in the sidebar.
 * For animated overlays (ecliptic ribbon, ghost bodies, trails) we need
 * to compute positions every frame with the animation offset applied,
 * which is much cheaper than re-running the entire engine and avoids
 * allocating CalculationStep objects 60 times a second.
 *
 * These functions are pure: take a single `days` (days from epoch)
 * argument and return numbers in degrees [0, 360).
 */
import { CONSTANTS } from './constants.js';
import { dmsToDecimal, normalizeDegrees } from './dmsUtils.js';

// ── Pre-computed constant decimals ───────────────────────────
const SUN_DAILY = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
const SUN_START = dmsToDecimal(CONSTANTS.SUN.START_POSITION);
const SUN_APOGEE_START =
  dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
  CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
const SUN_APOGEE_DAILY = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY;

const MOON_DAILY = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
const MOON_START =
  CONSTANTS.MOON.MEAN_LONGITUDE_AT_EPOCH +
  CONSTANTS.MOON.START_CONSTELLATION * 30;

const MOON_MASLUL_DAILY = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
const MOON_MASLUL_START = dmsToDecimal(CONSTANTS.MOON.MASLUL_START);

const NODE_DAILY = -dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION); // backwards
const NODE_START = dmsToDecimal(CONSTANTS.NODE.START_POSITION);

/**
 * Linear interpolation in a maslul correction table. The Rambam's tables
 * give values at 10° intervals; he instructs in KH 13:7-8 to interpolate
 * proportionally for in-between values.
 */
function interpolateCorrection(maslul, table) {
  const effective = maslul <= 180 ? maslul : 360 - maslul;
  for (let i = 0; i < table.length - 1; i++) {
    const cur = table[i];
    const nxt = table[i + 1];
    if (effective >= cur.maslul && effective <= nxt.maslul) {
      const ratio = (effective - cur.maslul) / (nxt.maslul - cur.maslul || 1);
      return cur.correction + ratio * (nxt.correction - cur.correction);
    }
  }
  return 0;
}

/**
 * Look up the double-elongation adjustment from the Rambam's table (KH 15:3).
 */
function doubleElongationAdjustment(merchakKaful) {
  const effective = merchakKaful <= 180 ? merchakKaful : 360 - merchakKaful;
  for (const entry of CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS) {
    if (effective >= entry.minElongation && effective <= entry.maxElongation) {
      return entry.adjustment;
    }
  }
  return 0;
}

/**
 * Compute live mean and true longitudes plus apogee for the sun.
 * Returns degrees in [0, 360).
 */
export function liveSun(days) {
  const meanLongitude = normalizeDegrees(SUN_START + SUN_DAILY * days);
  const apogee = normalizeDegrees(SUN_APOGEE_START + SUN_APOGEE_DAILY * days);
  const maslul = normalizeDegrees(meanLongitude - apogee);
  const correction = interpolateCorrection(maslul, CONSTANTS.SUN_MASLUL_CORRECTIONS);
  // KH 13:2-3: maslul < 180 → subtract; > 180 → add
  const trueLongitude = normalizeDegrees(
    maslul <= 180 ? meanLongitude - correction : meanLongitude + correction,
  );
  return { meanLongitude, apogee, maslul, correction, trueLongitude };
}

/**
 * Compute live mean and true longitudes plus node position for the moon.
 * Skips season correction (small enough to ignore for visualization).
 */
export function liveMoon(days, sunMeanLongitude) {
  const meanLongitude = normalizeDegrees(MOON_START + MOON_DAILY * days);
  const maslul = normalizeDegrees(MOON_MASLUL_START + MOON_MASLUL_DAILY * days);
  const node = normalizeDegrees(NODE_START + NODE_DAILY * days);

  // Double elongation correction → maslul hanachon
  const elongation = normalizeDegrees(meanLongitude - sunMeanLongitude);
  const doubleElong = (2 * elongation) % 360;
  const adjustment = doubleElongationAdjustment(doubleElong);
  const maslulHanachon = normalizeDegrees(maslul + adjustment);

  const correction = interpolateCorrection(
    maslulHanachon,
    CONSTANTS.MOON_MASLUL_CORRECTIONS,
  );
  const trueLongitude = normalizeDegrees(
    maslulHanachon <= 180
      ? meanLongitude - correction
      : meanLongitude + correction,
  );

  return {
    meanLongitude,
    trueLongitude,
    maslul,
    maslulHanachon,
    correction,
    node,
  };
}

/**
 * Compute everything for a given days-from-epoch value.
 */
export function liveAll(days) {
  const sun = liveSun(days);
  const moon = liveMoon(days, sun.meanLongitude);
  return { sun, moon };
}
