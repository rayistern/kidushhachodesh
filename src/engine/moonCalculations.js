/**
 * Moon position calculations per the Rambam's Hilchot Kiddush HaChodesh, chapters 14-16.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-17)
 *  SURFACE CATEGORY: internal (currently) / Rambam-surface (target per Q4)
 * ═══════════════════════════════════════════════════════════════════
 * See docs/OPEN_QUESTIONS.md Q2 (regime separation) and Q4 (engine
 * purism — the Rambam publishes period-block tables at KH 14:1, 14:2,
 * 16:2 that we currently bypass by computing `dailyMotion × days`.
 * Rework deferred.)
 *
 * The Rambam's procedure for finding the moon's true position:
 *   1. Find emtza hayareach (mean longitude) — KH 14:1-4
 *   2. Apply season correction to emtza hayareach — KH 14:5
 *   3. Find emtza hamaslul (mean anomaly on galgal katan) — KH 14:2-3
 *   4. Calculate merchak kaful (double elongation = 2x distance from sun) — KH 15:1
 *   5. Adjust emtza hamaslul by merchak kaful → maslul hanachon — KH 15:3
 *   6. Look up moon correction from MOON table (not sun's!) — KH 15:4-6
 *   7. Apply correction to emtza hayareach → makom amiti — KH 15:4
 *   8. Find rosh (ascending node) position — KH 16:2-3
 *   9. Calculate latitude from distance to rosh — KH 16:9-10
 *
 * Each function returns a CalculationStep for drill-down display.
 */
import { CONSTANTS, MOON_PHASES } from './constants.js';
import { dmsToDecimal, normalizeDegrees, formatDms } from './dmsUtils.js';

// ─── STEP 1: Moon Mean Longitude ────────────────────────────────

/** Moon's mean longitude (emtza hayareach) — KH 14:1 */
// AUDIT 2026-04-23: `dailyMotion × days` shortcut; Rambam's KH 14:1
// period-block tables not yet exposed. Q4.
export function calculateMoonMeanLongitude(daysFromBase) {
  const dailyMotion = dmsToDecimal(CONSTANTS.MOON.MEAN_MOTION_PER_DAY);
  const startPos = CONSTANTS.MOON.MEAN_LONGITUDE_AT_EPOCH + (CONSTANTS.MOON.START_CONSTELLATION * 30);
  const result = normalizeDegrees(startPos + dailyMotion * daysFromBase);
  return {
    id: 'moonMeanLongitude',
    name: 'Moon Mean Longitude',
    hebrewName: 'אמצע הירח',
    rambamRef: 'KH 14:1',
    source: 'rambam',
    sourceNote: 'Daily motion of 13° 10\' 35" and starting position directly from the Rambam.',
    teachingNote: 'The emtza hayareach is the center point of the galgal katan — where the small epicycle\'s center is, NOT where the moon actually is. The moon sits on the edge of the galgal katan.',
    inputs: {
      startPosition: { value: startPos, label: 'Position at Epoch (1°14\'43" in Taurus)', unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Daily Motion (13° 10\' 35")', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(startPosition + dailyMotion * days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── STEP 2: Season Correction ──────────────────────────────────

/** Season correction to moon mean longitude — KH 14:5 */
export function calculateSeasonCorrection(sunTrueLongitude) {
  const table = CONSTANTS.SEASON_CORRECTIONS;
  let adjustment = 0;
  for (const entry of table) {
    // Handle wrap-around at 360
    if (entry.sunFrom <= entry.sunTo) {
      if (sunTrueLongitude >= entry.sunFrom && sunTrueLongitude < entry.sunTo) {
        adjustment = entry.adjustment;
        break;
      }
    } else {
      // Wraps around 360→0
      if (sunTrueLongitude >= entry.sunFrom || sunTrueLongitude < entry.sunTo) {
        adjustment = entry.adjustment;
        break;
      }
    }
  }

  return {
    id: 'moonSeasonCorrection',
    name: 'Season Correction',
    hebrewName: 'תיקון עונתי',
    rambamRef: 'KH 14:5',
    source: 'rambam',
    sourceNote: 'The Rambam specifies this adjustment to account for the difference between 6:00 PM and actual sunset. The moon moves ~0.5° per hour.',
    teachingNote: 'We compute positions for 6 PM, but we can only SEE the moon after sunset. In summer, sunset is later, so the moon has moved further by then. In winter, sunset is earlier. This correction brings the mean longitude to the actual sunset moment.',
    inputs: {
      sunTrueLongitude: { value: sunTrueLongitude, label: 'Sun True Longitude', unit: '°' },
    },
    formula: 'Lookup from season table based on sun position in zodiac',
    result: adjustment,
    formatted: adjustment === 0 ? '0\' (no adjustment)' : formatDms(adjustment),
    unit: 'degrees',
  };
}

// ─── STEP 3: Moon Maslul (Anomaly) ────────────────────────────

/** Moon's maslul / emtza hamaslul (mean anomaly on galgal katan) — KH 14:2 */
// AUDIT 2026-04-23: `dailyMotion × days` shortcut; Rambam's KH 14:2
// period-block tables not yet exposed. Q4.
export function calculateMoonMaslul(daysFromBase) {
  const maslulStart = dmsToDecimal(CONSTANTS.MOON.MASLUL_START);
  const maslulMotion = dmsToDecimal(CONSTANTS.MOON.MASLUL_MEAN_MOTION);
  const result = normalizeDegrees(maslulStart + maslulMotion * daysFromBase);
  return {
    id: 'moonMaslul',
    name: 'Moon Maslul (Anomaly)',
    hebrewName: 'אמצע המסלול',
    rambamRef: 'KH 14:2-3',
    source: 'rambam',
    sourceNote: 'Daily motion of 13° 3\' 53 1/3" and starting position (84° 28\' 42") directly from the Rambam.',
    teachingNote: 'The emtza hamaslul tells us where the moon is on the galgal katan (small epicycle). At 0°/360° the moon is at the top (furthest from Earth = govah). At 180° it is closest to Earth. The galgal katan moves at 13° 3\' but appears to move faster due to the nekudah hanichaches (prosneusis point).',
    inputs: {
      maslulStart: { value: maslulStart, label: 'Maslul at Epoch (84° 28\' 42")', unit: '°' },
      maslulMotion: { value: maslulMotion, label: 'Daily Motion (13° 3\' 53 1/3")', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '(maslulStart + dailyMotion * days) mod 360',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── STEP 4: Double Elongation (Merchak Kaful) ──────────────────

/** Double elongation — KH 15:1-2 */
export function calculateDoubleElongation(moonMeanLon, sunMeanLon) {
  let merchak = normalizeDegrees(moonMeanLon - sunMeanLon);
  const merchakKaful = normalizeDegrees(merchak * 2);
  return {
    id: 'doubleElongation',
    name: 'Double Elongation',
    hebrewName: 'מרחק כפול',
    rambamRef: 'KH 15:1-2',
    source: 'rambam',
    sourceNote: 'The Rambam instructs: subtract emtza hashemesh from emtza hayareach, then double the result.',
    teachingNote: 'Why double? Because the moon\'s three outer galgalim move in OPPOSITE directions: the red+blue go 11°12\'/day mi\'mizrach l\'maarav, while the green goes 24°23\'/day mi\'maarav l\'mizrach. The sun also goes ~1°/day mi\'maarav l\'mizrach. So the effective separation has components in both directions — doubling captures the full angular effect. Rabbi Losh: "It\'s like money owed to the bank — you think you owe 12, before you blink you owe 24."',
    inputs: {
      moonMeanLon: { value: moonMeanLon, label: 'Moon Mean Longitude', unit: '°' },
      sunMeanLon: { value: sunMeanLon, label: 'Sun Mean Longitude', unit: '°' },
      merchak: { value: merchak, label: 'Simple Elongation', unit: '°' },
    },
    formula: '2 × (emtza hayareach − emtza hashemesh) mod 360',
    result: merchakKaful,
    formatted: formatDms(merchakKaful),
    unit: 'degrees',
  };
}

// ─── STEP 5: Maslul Hanachon (Corrected Course) ──────────────────

/** Adjust emtza hamaslul by double elongation → maslul hanachon — KH 15:3 */
export function calculateMaslulHanachon(emtzaMaslul, merchakKaful) {
  const table = CONSTANTS.DOUBLE_ELONGATION_ADJUSTMENTS;
  let adjustment = 0;
  let isApproximated = false;

  // The merchak kaful can be 0-360. For > 180, the Rambam doesn't specify
  // adjustments. We only adjust in the 0-180 range (visibility range).
  const effectiveMerchak = merchakKaful <= 180 ? merchakKaful : 360 - merchakKaful;

  for (const entry of table) {
    if (effectiveMerchak >= entry.minElongation && effectiveMerchak <= entry.maxElongation) {
      adjustment = entry.adjustment;
      if (entry.source === 'approximated') isApproximated = true;
      break;
    }
  }

  const result = normalizeDegrees(emtzaMaslul + adjustment);

  return {
    id: 'maslulHanachon',
    name: 'Corrected Course (Maslul Hanachon)',
    hebrewName: 'המסלול הנכון',
    rambamRef: 'KH 15:3',
    source: isApproximated ? 'approximated' : 'rambam',
    sourceNote: isApproximated
      ? 'The Rambam only specifies adjustments for merchak kaful 0-63°. Values beyond that are extrapolated.'
      : 'Adjustment table directly from the Rambam.',
    teachingNote: 'The nekudah hanichaches (prosneusis point) shifts the effective center from which the galgal katan\'s motion is measured. Instead of measuring from the green\'s center, or from Earth\'s center, the reference point is on the OPPOSITE side of Earth from the green\'s center. This is why the moon appears to move faster than 13° 3\' after the molad — and this table corrects for that effect.',
    inputs: {
      emtzaMaslul: { value: emtzaMaslul, label: 'Emtza Hamaslul', unit: '°' },
      merchakKaful: { value: merchakKaful, label: 'Merchak Kaful', unit: '°' },
      effectiveMerchak: { value: effectiveMerchak, label: 'Effective (for table)', unit: '°' },
      adjustment: { value: adjustment, label: 'Adjustment', unit: '°' },
    },
    formula: 'emtza hamaslul + adjustment(merchak kaful)',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── STEP 6: Moon Maslul Correction ──────────────────────────────

/** Moon's maslul correction from MOON-specific table — KH 15:4-6 */
export function lookupMoonMaslulCorrection(maslulHanachon) {
  // For maslul hanachon > 180°, subtract from 360° — KH 15:7
  const effectiveMaslul = maslulHanachon <= 180 ? maslulHanachon : 360 - maslulHanachon;
  const subtractDirection = maslulHanachon <= 180; // < 180 = subtract from emtza; > 180 = add

  const table = CONSTANTS.MOON_MASLUL_CORRECTIONS;
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
        // Linear interpolation between table entries
        const ratio = (effectiveMaslul - cur.maslul) / (nxt.maslul - cur.maslul);
        correction = cur.correction + ratio * (nxt.correction - cur.correction);
        isInterpolated = true;
      }
      break;
    }
  }

  return {
    id: 'moonMaslulCorrection',
    name: 'Moon Maslul Correction',
    hebrewName: 'מנת המסלול של הירח',
    rambamRef: 'KH 15:4-6',
    source: isInterpolated ? 'approximated' : 'rambam',
    sourceNote: isInterpolated
      ? 'Value interpolated between two entries in the Rambam\'s table. The Rambam instructs to interpolate linearly (KH 15:7).'
      : 'Value directly from the Rambam\'s moon correction table.',
    teachingNote: 'This table is DIFFERENT from the sun\'s table! The sun\'s max correction is ~2° at 90°. The moon\'s max is ~5° 8\' at 100°. This is because the galgal katan\'s diameter is 10° — the moon can be up to 5° away from the emtza hayareach on each side. The asymmetry (peak at 100° not 90°) comes from the nekudah hanichaches shifting the effective center.',
    inputs: {
      maslulHanachon: { value: maslulHanachon, label: 'Maslul Hanachon', unit: '°' },
      effectiveMaslul: { value: effectiveMaslul, label: 'Effective Maslul (for table)', unit: '°' },
      direction: { value: subtractDirection ? 'subtract' : 'add', label: 'Apply Direction' },
    },
    formula: "Linear interpolation from Rambam's MOON correction table (KH 15:4-6)",
    result: correction,
    formatted: formatDms(correction),
    unit: 'degrees',
    tableUsed: 'moon',
    direction: subtractDirection ? 'subtract' : 'add',
  };
}

// ─── STEP 7: Moon True Longitude ──────────────────────────────

/** Moon's true longitude (makom amiti) — KH 15:4 */
export function calculateMoonTrueLongitude(adjustedMeanLon, maslulHanachon, correction, correctionDirection) {
  const result = correctionDirection === 'subtract'
    ? normalizeDegrees(adjustedMeanLon - correction)
    : normalizeDegrees(adjustedMeanLon + correction);
  return {
    id: 'moonTrueLongitude',
    name: 'Moon True Longitude',
    hebrewName: 'מקום הירח האמיתי',
    rambamRef: 'KH 15:4',
    source: 'rambam',
    sourceNote: 'Direction rule from the Rambam: if maslul hanachon < 180° → subtract correction; if > 180° → add correction.',
    teachingNote: 'This is WHERE THE MOON ACTUALLY APPEARS in the mazalos from our perspective on Earth. Unlike the emtza hayareach (which is the galgal katan\'s center position), this accounts for the moon\'s actual position ON the galgal katan, adjusted for the off-center viewing angle (govah effect).',
    inputs: {
      adjustedMeanLon: { value: adjustedMeanLon, label: 'Adjusted Mean Longitude', unit: '°' },
      maslulHanachon: { value: maslulHanachon, label: 'Maslul Hanachon', unit: '°' },
      correction: { value: correction, label: 'Correction', unit: '°' },
      direction: { value: correctionDirection, label: 'Direction' },
    },
    formula: correctionDirection === 'subtract'
      ? 'adjustedMeanLon − correction'
      : 'adjustedMeanLon + correction',
    result,
    formatted: formatDms(result),
    unit: 'degrees',
  };
}

// ─── STEP 8: Ascending Node (Rosh) ──────────────────────────────

/** Position of the ascending node (rosh) — KH 16:2-3 */
// AUDIT 2026-04-23: `dailyMotion × days` shortcut; Rambam's KH 16:2
// period-block tables not yet exposed. Q4.
export function calculateNodePosition(daysFromBase) {
  const startPos = dmsToDecimal(CONSTANTS.NODE.START_POSITION);
  const dailyMotion = dmsToDecimal(CONSTANTS.NODE.DAILY_MOTION);
  // The node regresses (moves backwards through the zodiac)
  // The Rambam counts forward from Aries, then subtracts from 360
  const emtzaRosh = normalizeDegrees(startPos + dailyMotion * daysFromBase);
  const makomRosh = normalizeDegrees(360 - emtzaRosh);
  return {
    id: 'nodePosition',
    name: 'Ascending Node (Rosh)',
    hebrewName: 'ראש התלי',
    rambamRef: 'KH 16:2-4',
    source: 'rambam',
    sourceNote: 'Starting position (180° 57\' 28") and daily motion (3\' 11") directly from the Rambam. Moves achoranim (backwards) through the zodiac.',
    teachingNote: 'The rosh is where the moon\'s tilted orbital plane (galgal noteh / blue) crosses the ecliptic going north. The zanav (tail) is exactly 180° opposite — where the moon crosses going south. The rosh/zanav move backwards through the zodiac, completing a full cycle in ~18.6 years. This is caused by the red galgal (domeh) slowly rotating. When the moon is at the rosh or zanav, a solar or lunar eclipse is possible.',
    inputs: {
      startPos: { value: startPos, label: 'Rosh at Epoch (180° 57\' 28")', unit: '°' },
      dailyMotion: { value: dailyMotion, label: 'Daily Motion (3\' 11" backwards)', unit: '°/day' },
      daysFromBase: { value: daysFromBase, label: 'Days from Epoch' },
    },
    formula: '360 − (startPos + dailyMotion × days) mod 360',
    result: makomRosh,
    formatted: formatDms(makomRosh),
    unit: 'degrees',
  };
}

// ─── STEP 9: Moon Latitude ──────────────────────────────────────

/** Moon's latitude (north/south of ecliptic) — KH 16:9-10 */
export function calculateMoonLatitude(moonTrueLon, nodePosition) {
  // Distance from the ascending node
  const distFromNode = normalizeDegrees(moonTrueLon - nodePosition);

  // Determine which quadrant and reduce to 0-90° for table lookup
  let lookupAngle;
  let isNorth;
  if (distFromNode <= 90) {
    // 0-90°: moving northward
    lookupAngle = distFromNode;
    isNorth = true;
  } else if (distFromNode <= 180) {
    // 90-180°: returning from north
    lookupAngle = 180 - distFromNode;
    isNorth = true;
  } else if (distFromNode <= 270) {
    // 180-270°: moving southward (past zanav)
    lookupAngle = distFromNode - 180;
    isNorth = false;
  } else {
    // 270-360°: returning from south
    lookupAngle = 360 - distFromNode;
    isNorth = false;
  }

  // Lookup in the Rambam's latitude table
  const table = CONSTANTS.MOON_LATITUDE_TABLE;
  let latitude = 0;
  let isInterpolated = false;

  for (let i = 0; i < table.length - 1; i++) {
    const cur = table[i];
    const nxt = table[i + 1];
    if (lookupAngle >= cur.distance && lookupAngle <= nxt.distance) {
      if (lookupAngle === cur.distance) {
        latitude = cur.latitude;
      } else if (lookupAngle === nxt.distance) {
        latitude = nxt.latitude;
      } else {
        const ratio = (lookupAngle - cur.distance) / (nxt.distance - cur.distance);
        latitude = cur.latitude + ratio * (nxt.latitude - cur.latitude);
        isInterpolated = true;
      }
      break;
    }
  }

  const result = isNorth ? latitude : -latitude;
  const directionStr = isNorth ? 'North (צפון)' : 'South (דרום)';

  return {
    id: 'moonLatitude',
    name: 'Moon Latitude',
    hebrewName: 'רוחב הירח',
    rambamRef: 'KH 16:9-10',
    source: isInterpolated ? 'approximated' : 'rambam',
    sourceNote: isInterpolated
      ? 'Value interpolated between entries in the Rambam\'s latitude table.'
      : 'Value directly from the Rambam\'s latitude table.',
    teachingNote: 'The moon\'s orbit (galgal noteh / blue) is tilted 5° from the ecliptic. The maximum latitude of 5° is reached 90° from the rosh (ascending node). The rosh is where the moon crosses the ecliptic going north; the zanav (180° opposite) is where it crosses going south. This is called rochav — width or latitude.',
    inputs: {
      moonTrueLon: { value: moonTrueLon, label: 'Moon True Longitude', unit: '°' },
      nodePosition: { value: nodePosition, label: 'Rosh Position', unit: '°' },
      distFromNode: { value: distFromNode, label: 'Distance from Rosh', unit: '°' },
      lookupAngle: { value: lookupAngle, label: 'Lookup Angle (0-90°)', unit: '°' },
      direction: { value: directionStr, label: 'Direction' },
    },
    formula: 'latitude table lookup(|distance from rosh| reduced to 0-90°)',
    result,
    formatted: `${formatDms(Math.abs(result))} ${directionStr}`,
    unit: 'degrees',
  };
}

// ─── Moon Phase ──────────────────────────────────────────────────

/** Determine moon phase from elongation angle */
export function calculateMoonPhase(elongation) {
  for (const phase of MOON_PHASES) {
    if (elongation >= phase.min && elongation < phase.max) {
      return {
        id: 'moonPhase',
        name: 'Moon Phase',
        hebrewName: 'מופע הירח',
        rambamRef: 'KH 17',
        source: 'deduced',
        sourceNote: 'Phase names are modern terminology. The Rambam discusses visibility thresholds (9°-24°) but does not name phases.',
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
    source: 'deduced',
    result: 'Unknown',
    unit: '',
  };
}
