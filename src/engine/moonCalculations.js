/**
 * Moon position calculations per the Rambam's Hilchot Kiddush HaChodesh, chapters 14-16.
 * Each function returns a CalculationStep for drill-down display.
 */
import { CONSTANTS, MOON_PHASES } from './constants.js';
import { dmsToDecimal, normalizeDegrees, formatDms } from './dmsUtils.js';

/** Moon's mean longitude */
export function calculateMoonMeanLongitude(daysFromBase) {
  const dailyMotion = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
  const startPos = CONSTANTS.MOON.MEAN_LONGITUDE_AT_EPOCH;
  const result = normalizeDegrees(startPos + dailyMotion * daysFromBase);
  return {
    id: 'moonMeanLongitude',
    name: 'Moon Mean Longitude',
    hebrewName: 'אמצע הירח',
    rambamRef: 'KH 14:1',
    inputs: {
      startPosition: { value: startPos, label: 'Position at Epoch', unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Daily Motion (13° 10′ 35⅛″)', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(startPosition + dailyMotion × days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Moon's maslul (anomaly) — FIXED: now uses full DMS for both start and motion */
export function calculateMoonMaslul(daysFromBase) {
  const maslulStart = dmsToDecimal(CONSTANTS.MOON.MASLUL_START);
  const maslulMotion = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
  const result = normalizeDegrees(maslulStart + maslulMotion * daysFromBase);
  return {
    id: 'moonMaslul',
    name: 'Moon Maslul (Course)',
    hebrewName: 'מסלול הירח',
    rambamRef: 'KH 14:2',
    inputs: {
      maslulStart: { value: maslulStart, label: 'Maslul at Epoch (84° 28′ 42″)', unit: '°' },
      maslulMotion: { value: maslulMotion, label: 'Daily Motion (13° 3′ 53⅓″)', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(maslulStart + dailyMotion × days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
    bugFix: 'Previous version used only degrees (13) instead of full DMS (13.0648°)',
  };
}

/** Moon's maslul correction — uses same table as sun */
export function lookupMoonMaslulCorrection(maslul) {
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
    id: 'moonMaslulCorrection',
    name: 'Moon Maslul Correction',
    hebrewName: 'מנת המסלול של הירח',
    rambamRef: 'KH 15:3',
    inputs: {
      maslul: { value: maslul, label: 'Moon Maslul', unit: '°' },
      effectiveMaslul: { value: effectiveMaslul, label: 'Effective Maslul (for table)', unit: '°' },
      direction: { value: maslul <= 180 ? 'add' : 'subtract', label: 'Apply Direction' },
    },
    formula: "Linear interpolation from Rambam's correction table",
    result: correction,
    formatted: formatDms(correction),
    unit: 'degrees',
    tableUsed: true,
  };
}

/** Moon's true longitude */
export function calculateMoonTrueLongitude(meanLongitude, maslul, correction) {
  const result = maslul <= 180
    ? normalizeDegrees(meanLongitude + correction)
    : normalizeDegrees(meanLongitude - correction);
  return {
    id: 'moonTrueLongitude',
    name: 'Moon True Longitude',
    hebrewName: 'מקום הירח האמיתי',
    rambamRef: 'KH 15:4',
    inputs: {
      meanLongitude: { value: meanLongitude, label: 'Moon Mean Longitude', unit: '°' },
      maslul: { value: maslul, label: 'Moon Maslul', unit: '°' },
      correction: { value: correction, label: 'Correction', unit: '°' },
    },
    formula: maslul <= 180
      ? 'meanLongitude + correction'
      : 'meanLongitude - correction',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Moon's latitude (north/south of ecliptic) — Rambam KH 16 */
export function calculateMoonLatitude(daysFromBase) {
  const latitudeCycle = CONSTANTS.MOON.GALGALIM.LATITUDE_CYCLE; // draconic month
  const maxLatitude = CONSTANTS.MOON.GALGALIM.INCLINATION;
  const phase = (daysFromBase % latitudeCycle) / latitudeCycle;
  const result = maxLatitude * Math.sin(2 * Math.PI * phase);
  return {
    id: 'moonLatitude',
    name: 'Moon Latitude',
    hebrewName: 'רוחב הירח',
    rambamRef: 'KH 16:1-3',
    inputs: {
      latitudeCycle: { value: latitudeCycle, label: 'Draconic Month', unit: 'days' },
      maxLatitude: { value: maxLatitude, label: 'Max Latitude', unit: '°' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: 'maxLatitude × sin(2π × (days mod draconicMonth) / draconicMonth)',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Determine moon phase from elongation angle */
export function calculateMoonPhase(elongation) {
  for (const phase of MOON_PHASES) {
    if (elongation >= phase.min && elongation < phase.max) {
      return {
        id: 'moonPhase',
        name: 'Moon Phase',
        hebrewName: 'מופע הירח',
        rambamRef: 'KH 17',
        inputs: { elongation: { value: elongation, label: 'Elongation', unit: '°' } },
        formula: 'Phase determined by elongation angle ranges',
        result: phase.name,
        hebrewResult: phase.hebrewName,
        unit: '',
      };
    }
  }
  return {
    id: 'moonPhase',
    name: 'Moon Phase',
    hebrewName: 'מופע הירח',
    result: 'Unknown',
    unit: '',
  };
}
