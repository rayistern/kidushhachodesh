/**
 * Sun position calculations per the Rambam's Hilchot Kiddush HaChodesh, chapters 12-13.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17)
 *  SURFACE CATEGORY: internal (currently) / Rambam-surface (target per Q4)
 * ═══════════════════════════════════════════════════════════════════
 * See docs/OPEN_QUESTIONS.md Q2 (regime separation) and Q4 (engine
 * purism — the Rambam publishes period-block tables at KH 12:3 that
 * we currently bypass by computing `dailyMotion × days`. Mathematical
 * equivalence, pedagogical non-equivalence. Rework deferred.)
 *
 * The Rambam's procedure for the sun:
 *   1. Find emtza hashemesh (mean longitude) — KH 12:1
 *   2. Find govah hashemesh (apogee position) — KH 12:2
 *   3. Calculate maslul hashemesh (distance from apogee) — KH 13:1
 *   4. Look up maslul correction in SUN table — KH 13:4
 *   5. Apply correction → makom amiti (true longitude) — KH 13:5
 *
 * Rabbi Losh's teaching: The sun has TWO galgalim:
 *   Blue (outer) = slowly rotating, carries the govah. ~1°/70 years.
 *   Red (inner) = off-center inside the blue, carries the sun. Bulk of the ~59'8"/day motion.
 *   The emtzoi is the sun's address as seen from the red's center.
 *   The amiti is the sun's address as seen from Earth (the blue's center).
 *
 * Each function returns a CalculationStep for drill-down display.
 */
import { CONSTANTS } from './constants.js';
import { dmsToDecimal, normalizeDegrees, formatDms } from './dmsUtils.js';
import { daysFromEpoch, HDate } from './epochDays.js';

/**
 * Calculate Hebrew-calendar days from the Rambam's epoch (3 Nisan 4938 AM).
 *
 * Accepts a JS Date or an HDate. Uses hebcal's absolute-day count so the
 * calculation path never round-trips through Gregorian/Julian civil dates.
 */
export function calculateDaysFromEpoch(date) {
  const hd = date instanceof HDate ? date : new HDate(date);
  const daysFromBase = daysFromEpoch(hd);
  return {
    id: 'daysFromEpoch',
    regime: 'crossing',
    name: 'Days from Epoch',
    hebrewName: 'ימים מתחילת המניין',
    rambamRef: 'KH 11:16',
    source: 'rambam',
    // AUDIT 2026-04-23: this is the ONE step in the pipeline that crosses
    // regimes — its value is a fixed-calendar output (Hillel II's integer
    // day count, KH 6-10) that the astronomical pipeline (KH 11-17)
    // consumes. Common trap: users compute "mean synodic time" instead
    // (10,488 × 29d 12h 793p ≈ 309,716.87 days for 3 Nisan 5786) and
    // feed THAT into KH 12:1. Wrong input — KH 12:1 asks for integer
    // civil days, which drift from mean-synodic time by ~0.13 day over
    // 848 years due to dehiyot. See docs/OPEN_QUESTIONS.md Q1.
    sourceNote: 'Epoch date (3 Nisan 4938 AM, ליל חמישי) directly from the Rambam. This is an INTEGER civil-day count from the fixed calendar (KH 6-10) — NOT mean-synodic time. The two drift apart by ~0.13 day over 848 years. See "Methodology notes" link for the full writeup.',
    inputs: {
      date: { value: hd.toString(), label: 'Selected Date (Hebrew)' },
      epoch: { value: '3 Nisan 4938', label: 'Epoch' },
    },
    formula: 'HDate(date).abs() − HDate(3 Nisan 4938).abs()',
    result: daysFromBase,
    unit: 'days',
  };
}

/** Sun's mean daily motion in decimal degrees */
export function getSunDailyMotion() {
  const motion = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
  return {
    id: 'sunDailyMotion',
    regime: 'astronomical',
    name: 'Sun Daily Motion',
    hebrewName: 'מהלך אמצע השמש ליום',
    rambamRef: 'KH 12:1',
    source: 'rambam',
    sourceNote: 'Nun Tes Ches (59\' 8") — the combined motion of both the blue and red galgalim together.',
    teachingNote: 'This is NOT the motion of the red galgal alone, nor the blue alone. It is the sum total of both. The blue moves extremely slowly (~1°/70 years). The red carries the bulk of the motion. Together: 0° 59\' 8 1/3" per day.',
    inputs: {
      degrees: { value: 0, label: 'Degrees' },
      minutes: { value: 59, label: 'Minutes' },
      seconds: { value: '8 1/3', label: 'Seconds' },
    },
    formula: "0° + 59'/60 + 8.333\"/3600",
    result: motion,
    unit: 'deg/day',
  };
}

/** Sun's mean longitude at a given date */
// AUDIT 2026-04-23: currently computes `dailyMotion × days`. The
// Rambam's KH 12:3 publishes motion-per-period blocks (10d, 100d, 1000d,
// 10000d, 29d, 354d, 19-year cycle) that the student is meant to sum.
// Mathematically identical, pedagogically different. See Q4 in
// docs/OPEN_QUESTIONS.md. Deferred rework.
export function calculateSunMeanLongitude(daysFromBase) {
  const dailyMotion = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
  const startPos = dmsToDecimal(CONSTANTS.SUN.START_POSITION);
  const result = normalizeDegrees(startPos + dailyMotion * daysFromBase);
  return {
    id: 'sunMeanLongitude',
    regime: 'astronomical',
    name: 'Sun Mean Longitude',
    hebrewName: 'אמצע השמש',
    rambamRef: 'KH 12:1-2',
    source: 'rambam',
    sourceNote: 'Position at epoch = 7°3\'32" in Aries (KH 12:2). Daily motion per the Rambam.',
    teachingNote: 'The emtzoi: where the sun appears in the mazalos if you were standing at the CENTER OF THE RED GALGAL. Since the red\'s center is not at Earth, this is NOT where we see the sun. But it is the essential first step — "first know the sun\'s own language, then translate to ours." (Rabbi Losh)',
    inputs: {
      startPosition: { value: startPos, label: 'Position at Epoch', unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Daily Motion', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(startPosition + dailyMotion * days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Sun's apogee (govah) position */
// AUDIT 2026-04-23: same `dailyMotion × days` shortcut as mean
// longitude. Rambam's period-block approach not yet exposed. Q4.
export function calculateSunApogee(daysFromBase) {
  const apogeeStartDeg = dmsToDecimal(CONSTANTS.SUN.APOGEE_START);
  const constellationOffset = CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
  const apogeeStart = apogeeStartDeg + constellationOffset;
  const dailyMotion = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY;
  const result = normalizeDegrees(apogeeStart + dailyMotion * daysFromBase);
  return {
    id: 'sunApogee',
    regime: 'astronomical',
    name: "Sun's Apogee (Govah)",
    hebrewName: 'גובה השמש',
    rambamRef: 'KH 12:2',
    source: 'rambam',
    sourceNote: 'Starting position at epoch (26° 45\' 8" in Gemini) and daily motion (~1.5"/day) from the Rambam.',
    teachingNote: 'The govah is the point on the red galgal that is FURTHEST from Earth (because the red is off-center in the blue). It moves very slowly — about 1° every 70 years. This is the motion of the BLUE galgal. When the sun is at the govah, it appears to us to move slower (covering fewer degrees per day) because it is further away. Rabbi Losh\'s airplane mashal: a plane at high altitude seems to crawl, but at low altitude the same speed looks blazing fast.',
    inputs: {
      apogeeStart: { value: apogeeStart, label: `Apogee at Epoch (26° 45' 8" in Gemini)`, unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Apogee Daily Motion (~1.5"/day)', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(apogeeStart + dailyMotion * days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Sun's maslul (course/anomaly) — distance from apogee */
export function calculateSunMaslul(meanLongitude, apogee) {
  let maslul = meanLongitude - apogee;
  if (maslul < 0) maslul += 360;
  return {
    id: 'sunMaslul',
    regime: 'astronomical',
    name: 'Sun Maslul (Course)',
    hebrewName: 'מסלול השמש',
    rambamRef: 'KH 13:1-3',
    source: 'rambam',
    sourceNote: 'Maslul = distance of the sun from the govah (apogee). Directly from the Rambam.',
    teachingNote: 'How far is the sun from the govah? This distance determines how much the emtzoi differs from the amiti. At 0° or 360° (sun at govah) there is NO difference. At 180° (sun opposite govah, closest to Earth) there is also no difference. The maximum difference (~2°) occurs around 90°, where the viewing angle between Earth and the red\'s center diverges most.',
    inputs: {
      meanLongitude: { value: meanLongitude, label: 'Sun Mean Longitude', unit: '°' },
      apogee: { value: apogee, label: 'Sun Apogee', unit: '°' },
    },
    formula: '(meanLongitude − apogee + 360) mod 360',
    result: maslul,
    formatted: formatDms(maslul),
    unit: 'degrees',
  };
}

/** Maslul correction via linear interpolation of the Rambam's SUN table — KH 13:4 */
export function lookupMaslulCorrection(maslul) {
  const effectiveMaslul = maslul <= 180 ? maslul : 360 - maslul;
  const table = CONSTANTS.SUN_MASLUL_CORRECTIONS;

  let correction = 0;
  let isInterpolated = false;

  for (let i = 0; i < table.length - 1; i++) {
    const cur = table[i];
    const nxt = table[i + 1];
    if (effectiveMaslul >= cur.maslul && effectiveMaslul <= nxt.maslul) {
      if (effectiveMaslul === cur.maslul) {
        correction = cur.correction;
      } else if (effectiveMaslul === nxt.maslul) {
        correction = nxt.correction;
      } else {
        const ratio = (effectiveMaslul - cur.maslul) / (nxt.maslul - cur.maslul);
        correction = cur.correction + ratio * (nxt.correction - cur.correction);
        isInterpolated = true;
      }
      break;
    }
  }

  return {
    id: 'sunMaslulCorrection',
    regime: 'astronomical',
    name: 'Sun Maslul Correction',
    hebrewName: 'מנת המסלול של השמש',
    rambamRef: 'KH 13:4',
    source: isInterpolated ? 'approximated' : 'rambam',
    sourceNote: isInterpolated
      ? 'Interpolated between table entries. The Rambam instructs to interpolate proportionally (KH 13:7-8).'
      : 'Value directly from the Rambam\'s sun correction table.',
    teachingNote: 'The menaseh hamaslul: the portion we add or subtract to translate the emtzoi to the amiti. If maslul < 180° the correction is SUBTRACTED (sun appears behind where its emtzoi says). If > 180° it is ADDED. Maximum correction: ~2° near 90° maslul.',
    inputs: {
      maslul: { value: maslul, label: 'Maslul', unit: '°' },
      effectiveMaslul: { value: effectiveMaslul, label: 'Effective Maslul (for table)', unit: '°' },
      direction: { value: maslul <= 180 ? 'subtract' : 'add', label: 'Apply Direction' },
    },
    formula: "Linear interpolation from Rambam's SUN correction table (KH 13:4)",
    result: correction,
    formatted: formatDms(correction),
    unit: 'degrees',
    tableUsed: 'sun',
  };
}

/** Sun's true longitude — the final result */
export function calculateSunTrueLongitude(meanLongitude, maslul, correction) {
  // KH 13:2-3: if maslul < 180° subtract; if > 180° add
  const result = maslul <= 180
    ? normalizeDegrees(meanLongitude - correction)
    : normalizeDegrees(meanLongitude + correction);
  return {
    id: 'sunTrueLongitude',
    regime: 'astronomical',
    name: 'Sun True Longitude',
    hebrewName: 'מקום השמש האמיתי',
    rambamRef: 'KH 13:2-6',
    source: 'rambam',
    sourceNote: 'Direction rule (subtract if < 180°, add if > 180°) directly from the Rambam.',
    teachingNote: 'The amiti: where the sun ACTUALLY appears in the mazalos from our perspective on Earth. This is the "lashon kodesh" — the common language that both sun and moon must be translated into before we can compare them. This is what Beis Din needs to know for the molad calculation.',
    inputs: {
      meanLongitude: { value: meanLongitude, label: 'Sun Mean Longitude', unit: '°' },
      maslul: { value: maslul, label: 'Maslul', unit: '°' },
      correction: { value: correction, label: 'Correction', unit: '°' },
      direction: { value: maslul <= 180 ? 'subtract' : 'add', label: 'Direction' },
    },
    formula: maslul <= 180
      ? 'meanLongitude − correction'
      : 'meanLongitude + correction',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}
