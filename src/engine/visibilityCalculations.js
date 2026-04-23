/**
 * Moon visibility calculations per Rambam KH chapter 17.
 * Determines whether the new crescent moon can be sighted.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 17-19, downstream of KH 11-17)
 *  SURFACE CATEGORY: internal intermediate
 * ═══════════════════════════════════════════════════════════════════
 * See docs/OPEN_QUESTIONS.md. All inputs here come from the
 * astronomical pipeline (true longitudes, latitude). No fixed-calendar
 * dependency. Safe for drill-down retrofit.
 */
import { normalizeDegrees, formatDms } from './dmsUtils.js';

/** Elongation — angular distance between moon and sun */
export function calculateElongation(moonTrueLon, sunTrueLon) {
  const result = normalizeDegrees(moonTrueLon - sunTrueLon);
  return {
    id: 'elongation',
    regime: 'astronomical',
    name: 'Elongation (Moon-Sun Distance)',
    hebrewName: 'אורך ראשון',
    rambamRef: 'KH 17:1',
    inputs: {
      moonTrueLon: { value: moonTrueLon, label: 'Moon True Longitude', unit: '°' },
      sunTrueLon: { value: sunTrueLon, label: 'Sun True Longitude', unit: '°' },
    },
    formula: '(moonTrueLongitude - sunTrueLongitude + 360) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** First visibility angle — adjusted for latitude */
export function calculateFirstVisibilityAngle(elongation, latitude) {
  const result = elongation + 0.3 * Math.abs(latitude);
  return {
    id: 'firstVisibilityAngle',
    regime: 'astronomical',
    name: 'First Visibility Angle',
    hebrewName: 'זווית הראייה הראשונה',
    rambamRef: 'KH 17:3-5',
    inputs: {
      elongation: { value: elongation, label: 'Elongation', unit: '°' },
      latitude: { value: latitude, label: 'Moon Latitude', unit: '°' },
      latitudeFactor: { value: 0.3, label: 'Latitude Factor' },
    },
    formula: 'elongation + 0.3 × |latitude|',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

/** Whether the moon is potentially visible */
export function determineVisibility(firstVisAngle, elongation, latitude) {
  const visible = firstVisAngle > 12 && elongation > 12 && elongation < 348 && Math.abs(latitude) < 6;
  return {
    id: 'moonVisibility',
    regime: 'astronomical',
    name: 'Moon Visibility',
    hebrewName: 'ראיית הירח',
    rambamRef: 'KH 17:3-22',
    inputs: {
      firstVisAngle: { value: firstVisAngle, label: 'First Visibility Angle', unit: '°' },
      elongation: { value: elongation, label: 'Elongation', unit: '°' },
      latitude: { value: latitude, label: 'Latitude', unit: '°' },
    },
    formula: 'visibilityAngle > 12° AND elongation ∈ (12°, 348°) AND |latitude| < 6°',
    result: visible,
    unit: 'boolean',
  };
}

/** Seasonal info — basic calculation */
export function calculateSeasonalInfo(daysFromBase) {
  const solarYear = 365.25;
  const seasonLen = solarYear / 4;
  const yearPos = (((daysFromBase % solarYear) + solarYear) % solarYear) / solarYear;
  const dayInYear = Math.floor(((daysFromBase % solarYear) + solarYear) % solarYear);

  const seasonIdx = Math.floor(yearPos * 4);
  const seasonArr = ['Spring (אביב)', 'Summer (קיץ)', 'Fall (סתיו)', 'Winter (חורף)'];
  return {
    id: 'seasonalInfo',
    regime: 'astronomical',
    name: 'Season',
    hebrewName: 'תקופה',
    rambamRef: 'KH 9:3',
    result: {
      currentSeason: seasonArr[seasonIdx] || seasonArr[0],
      daysUntilNextSeason: Math.ceil(seasonLen - (dayInYear % seasonLen)),
    },
    unit: '',
  };
}
