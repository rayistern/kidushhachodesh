/**
 * Sun position calculations per the Rambam's Hilchot Kiddush HaChodesh, chapters 12-13.
 * Each function returns a CalculationStep for drill-down display.
 */
import { CONSTANTS } from './constants.js';
import { dmsToDecimal, normalizeDegrees, formatDms } from './dmsUtils.js';

/** Calculate days from the Rambam's epoch (3 Nisan 4938 / April 3, 1177 CE) */
export function calculateDaysFromEpoch(date) {
  const daysFromBase = Math.floor((date - CONSTANTS.BASE_DATE) / 8.64e7);
  return {
    id: 'daysFromEpoch',
    name: 'Days from Epoch',
    hebrewName: 'ימים מתחילת המניין',
    rambamRef: 'KH 11:16',
    inputs: {
      date: { value: date.toISOString().slice(0, 10), label: 'Selected Date' },
      epoch: { value: '1177-04-03', label: 'Epoch (3 Nisan 4938)' },
    },
    formula: '(date - epoch) / millisecondsPerDay',
    result: daysFromBase,
    unit: 'days',
  };
}

/** Sun's mean daily motion in decimal degrees */
export function getSunDailyMotion() {
  const motion = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
  return {
    id: 'sunDailyMotion',
    name: 'Sun Daily Motion',
    hebrewName: 'מהלך אמצע השמש ליום',
    rambamRef: 'KH 12:1',
    inputs: {
      degrees: { value: 0, label: 'Degrees' },
      minutes: { value: 59, label: 'Minutes' },
      seconds: { value: '8⅓', label: 'Seconds' },
    },
    formula: "0° + 59′/60 + 8⅓″/3600",
    result: motion,
    unit: 'deg/day',
  };
}

/** Sun's mean longitude at a given date */
export function calculateSunMeanLongitude(daysFromBase) {
  const dailyMotion = dmsToDecimal(CONSTANTS.SUN.MEAN_MOTION_PER_DAY);
  const startPos = dmsToDecimal(CONSTANTS.SUN.START_POSITION);
  const result = normalizeDegrees(startPos + dailyMotion * daysFromBase);
  return {
    id: 'sunMeanLongitude',
    name: 'Sun Mean Longitude',
    hebrewName: 'אמצע השמש',
    rambamRef: 'KH 12:1-2',
    inputs: {
      startPosition: { value: startPos, label: 'Position at Epoch', unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Daily Motion', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(startPosition + dailyMotion × days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Sun's apogee (govah) position */
export function calculateSunApogee(daysFromBase) {
  const apogeeStartDeg = dmsToDecimal(CONSTANTS.SUN.APOGEE_START);
  const constellationOffset = CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;
  const apogeeStart = apogeeStartDeg + constellationOffset;
  const dailyMotion = CONSTANTS.SUN.APOGEE_MOTION_PER_DAY;
  const result = normalizeDegrees(apogeeStart + dailyMotion * daysFromBase);
  return {
    id: 'sunApogee',
    name: "Sun's Apogee (Govah)",
    hebrewName: 'גובה השמש',
    rambamRef: 'KH 12:1',
    inputs: {
      apogeeStart: { value: apogeeStart, label: `Apogee at Epoch (26°45′8″ in Gemini)`, unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Apogee Daily Motion', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(apogeeStart + dailyMotion × days) mod 360',
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
    name: 'Sun Maslul (Course)',
    hebrewName: 'מסלול השמש',
    rambamRef: 'KH 13:1-3',
    inputs: {
      meanLongitude: { value: meanLongitude, label: 'Sun Mean Longitude', unit: '°' },
      apogee: { value: apogee, label: 'Sun Apogee', unit: '°' },
    },
    formula: '(meanLongitude - apogee + 360) mod 360',
    result: maslul,
    formatted: formatDms(maslul),
    unit: 'degrees',
  };
}

/** Maslul correction via linear interpolation of the Rambam's table */
export function lookupMaslulCorrection(maslul) {
  // For maslul > 180°, use (360 - maslul) and the correction is subtracted
  const effectiveMaslul = maslul <= 180 ? maslul : 360 - maslul;
  const table = CONSTANTS.MASLUL_CORRECTIONS;

  let correction = 0;
  for (let i = 0; i < table.length - 1; i++) {
    const cur = table[i];
    const nxt = table[i + 1];
    if (effectiveMaslul >= cur.maslul && effectiveMaslul <= nxt.maslul) {
      const ratio = (effectiveMaslul - cur.maslul) / (nxt.maslul - cur.maslul);
      correction = cur.correction + ratio * (nxt.correction - cur.correction);
      break;
    }
  }

  return {
    id: 'sunMaslulCorrection',
    name: 'Sun Maslul Correction',
    hebrewName: 'מנת המסלול של השמש',
    rambamRef: 'KH 13:4',
    inputs: {
      maslul: { value: maslul, label: 'Maslul', unit: '°' },
      effectiveMaslul: { value: effectiveMaslul, label: 'Effective Maslul (for table)', unit: '°' },
      direction: { value: maslul <= 180 ? 'add' : 'subtract', label: 'Apply Direction' },
    },
    formula: 'Linear interpolation from Rambam\'s correction table (KH 13:4)',
    result: correction,
    formatted: formatDms(correction),
    unit: 'degrees',
    tableUsed: true,
  };
}

/** Sun's true longitude — the final result */
export function calculateSunTrueLongitude(meanLongitude, maslul, correction) {
  const result = maslul <= 180
    ? normalizeDegrees(meanLongitude + correction)
    : normalizeDegrees(meanLongitude - correction);
  return {
    id: 'sunTrueLongitude',
    name: 'Sun True Longitude',
    hebrewName: 'מקום השמש האמיתי',
    rambamRef: 'KH 13:5-6',
    inputs: {
      meanLongitude: { value: meanLongitude, label: 'Sun Mean Longitude', unit: '°' },
      maslul: { value: maslul, label: 'Maslul', unit: '°' },
      correction: { value: correction, label: 'Correction', unit: '°' },
      direction: { value: maslul <= 180 ? 'add' : 'subtract', label: 'Direction' },
    },
    formula: maslul <= 180
      ? 'meanLongitude + correction'
      : 'meanLongitude - correction',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}
