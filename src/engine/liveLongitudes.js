/**
 * Live longitude helpers — compute celestial positions every animation
 * frame WITHOUT routing through the full calculation pipeline.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17 fast path)
 *  SURFACE CATEGORY: internal utility
 * ═══════════════════════════════════════════════════════════════════
 * Computes mean longitudes via the SAME period-block tables as the
 * pipeline (`meanLongitudeByPeriodBlocks`) so the animation overlays
 * agree with the sidebar to the arc-second at integer days. Fractional
 * days extend the whole-day block value linearly by the daily rate,
 * and the whole-day bases are cached so per-frame cost stays at a few
 * multiply-adds. The node uses the pipeline's KH 16:3 formula
 * (makom rosh = 360 − emtza) and the moon mean gets the KH 14:5
 * season correction, exactly as in `getFullCalculation`.
 *
 * (Until 2026-08-05 this file used `dailyMotion × days` with a
 * different node formula and no season correction, drifting from the
 * pipeline by ~2.6° for the moon and ~30° for the node — see
 * docs/OPEN_QUESTIONS.md Q2/Q7 and the equivalence tests in
 * `__tests__/liveLongitudes.test.js`.)
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
import { meanLongitudeByPeriodBlocks } from './periodBlocks.js';
import { calculateSeasonCorrection } from './moonCalculations.js';

// ── Pre-computed rates and epoch starts (same expressions as the
//    pipeline step builders in sunCalculations.js / moonCalculations.js) ──
const SUN_DAILY = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
const SUN_START = dmsToDecimal(CONSTANTS.SUN.START_POSITION);
const SUN_APOGEE_DAILY = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY;
const SUN_APOGEE_START =
  dmsToDecimal(CONSTANTS.SUN.APOGEE_START) +
  CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;

const MOON_DAILY = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
const MOON_START =
  CONSTANTS.MOON.MEAN_LONGITUDE_AT_EPOCH +
  CONSTANTS.MOON.START_CONSTELLATION * 30;

const MOON_MASLUL_DAILY = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
const MOON_MASLUL_START = dmsToDecimal(CONSTANTS.MOON.MASLUL_START);

const NODE_DAILY = dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);
const NODE_START = dmsToDecimal(CONSTANTS.NODE.START_POSITION);

// ── Whole-day base cache ─────────────────────────────────────
// Period-block sums only change when the integer day changes; within a
// day the animation only varies the fraction. Cache the five bases.
let cachedWholeDay = null;
let cachedBases = null;

function basesFor(wholeDay) {
  if (wholeDay !== cachedWholeDay) {
    if (wholeDay >= 0) {
      cachedBases = {
        sunMean: meanLongitudeByPeriodBlocks(
          wholeDay, CONSTANTS.SUN_MEAN_PERIOD_BLOCKS, SUN_DAILY, SUN_START).result,
        sunApogee: meanLongitudeByPeriodBlocks(
          wholeDay, CONSTANTS.SUN_APOGEE_PERIOD_BLOCKS, SUN_APOGEE_DAILY, SUN_APOGEE_START).result,
        moonMean: meanLongitudeByPeriodBlocks(
          wholeDay, CONSTANTS.MOON_MEAN_PERIOD_BLOCKS, MOON_DAILY, MOON_START).result,
        moonMaslul: meanLongitudeByPeriodBlocks(
          wholeDay, CONSTANTS.MOON_MASLUL_PERIOD_BLOCKS, MOON_MASLUL_DAILY, MOON_MASLUL_START).result,
        nodeEmtza: meanLongitudeByPeriodBlocks(
          wholeDay, CONSTANTS.NODE_PERIOD_BLOCKS, NODE_DAILY, NODE_START).result,
      };
    } else {
      // Pre-epoch: decomposeDays clamps to 0, so extend linearly. The
      // scene never scrubs before 1178 CE in practice.
      cachedBases = {
        sunMean: normalizeDegrees(SUN_START + SUN_DAILY * wholeDay),
        sunApogee: normalizeDegrees(SUN_APOGEE_START + SUN_APOGEE_DAILY * wholeDay),
        moonMean: normalizeDegrees(MOON_START + MOON_DAILY * wholeDay),
        moonMaslul: normalizeDegrees(MOON_MASLUL_START + MOON_MASLUL_DAILY * wholeDay),
        nodeEmtza: normalizeDegrees(NODE_START + NODE_DAILY * wholeDay),
      };
    }
    cachedWholeDay = wholeDay;
  }
  return cachedBases;
}

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
  // Round to the nearest whole degree per KH 15:3 ("או קרוב לחמש") — the
  // bands are stated in whole degrees and a fractional value between two
  // bands must not fall through. Mirrors calculateMaslulHanachon.
  const rounded = Math.round(effective);
  for (const entry of CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS) {
    if (rounded >= entry.minElongation && rounded <= entry.maxElongation) {
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
  const wholeDay = Math.floor(days);
  const frac = days - wholeDay;
  const bases = basesFor(wholeDay);

  const meanLongitude = normalizeDegrees(bases.sunMean + SUN_DAILY * frac);
  const apogee = normalizeDegrees(bases.sunApogee + SUN_APOGEE_DAILY * frac);
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
 * `sunTrueLongitude` drives the KH 14:5 season correction exactly as in
 * the pipeline; if omitted, the sun mean is used as its stand-in (the
 * correction bands are 15°-30° wide, so this only matters within ~2° of
 * a band edge).
 */
export function liveMoon(days, sunMeanLongitude, sunTrueLongitude = sunMeanLongitude) {
  const wholeDay = Math.floor(days);
  const frac = days - wholeDay;
  const bases = basesFor(wholeDay);

  const rawMeanLongitude = normalizeDegrees(bases.moonMean + MOON_DAILY * frac);
  const maslul = normalizeDegrees(bases.moonMaslul + MOON_MASLUL_DAILY * frac);
  // KH 16:3: makom harosh = 360 − emtza harosh (same as calculateNodePosition)
  const node = normalizeDegrees(360 - normalizeDegrees(bases.nodeEmtza + NODE_DAILY * frac));

  // KH 14:5 season correction → mean longitude at sha'at ha're'iyah
  const seasonAdjustment = calculateSeasonCorrection(sunTrueLongitude).result;
  const meanLongitude = normalizeDegrees(rawMeanLongitude + seasonAdjustment);

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
  const moon = liveMoon(days, sun.meanLongitude, sun.trueLongitude);
  return { sun, moon };
}
