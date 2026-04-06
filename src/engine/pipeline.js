/**
 * Calculation pipeline — orchestrates all astronomical calculations
 * for a given date and returns the full chain of CalculationSteps.
 *
 * The Rambam's complete procedure:
 *   SUN: epoch → mean lon → apogee → maslul → correction → true lon
 *   MOON: epoch → mean lon → season correction → adjusted mean lon
 *         → maslul → double elongation → maslul hanachon → moon correction
 *         → true lon → node → latitude
 *   VISIBILITY: elongation → phase → first visibility → visible?
 */
import {
  calculateDaysFromEpoch,
  getSunDailyMotion,
  calculateSunMeanLongitude,
  calculateSunApogee,
  calculateSunMaslul,
  lookupMaslulCorrection,
  calculateSunTrueLongitude,
} from './sunCalculations.js';
import {
  calculateMoonMeanLongitude,
  calculateSeasonCorrection,
  calculateMoonMaslul,
  calculateDoubleElongation,
  calculateMaslulHanachon,
  lookupMoonMaslulCorrection,
  calculateMoonTrueLongitude,
  calculateNodePosition,
  calculateMoonLatitude,
  calculateMoonPhase,
} from './moonCalculations.js';
import {
  calculateElongation,
  calculateFirstVisibilityAngle,
  determineVisibility,
  calculateSeasonalInfo,
} from './visibilityCalculations.js';
import { CONSTANTS } from './constants.js';
import { normalizeDegrees } from './dmsUtils.js';

/**
 * Run all Rambam calculations for a given date.
 * Returns { steps, sun, moon, visibility, season } where:
 *  - steps: ordered array of all CalculationStep objects (for drill-down UI)
 *  - sun/moon/visibility/season: convenience accessors for final values
 */
export function getFullCalculation(date) {
  // ── Step 1: Days from epoch ──
  const epochStep = calculateDaysFromEpoch(date);
  const days = epochStep.result;

  // ── Step 2: Sun calculations (needed before moon's double elongation) ──
  const sunDailyMotion = getSunDailyMotion();
  const sunMeanLon = calculateSunMeanLongitude(days);
  const sunApogee = calculateSunApogee(days);
  const sunMaslul = calculateSunMaslul(sunMeanLon.result, sunApogee.result);
  const sunCorrection = lookupMaslulCorrection(sunMaslul.result);
  const sunTrueLon = calculateSunTrueLongitude(
    sunMeanLon.result, sunMaslul.result, sunCorrection.result
  );

  // ── Step 3: Moon mean longitude ──
  const moonMeanLon = calculateMoonMeanLongitude(days);

  // ── Step 4: Season correction (KH 14:5) — adjusts moon mean lon for sunset timing ──
  const seasonCorrection = calculateSeasonCorrection(sunTrueLon.result);
  const adjustedMoonMeanLon = normalizeDegrees(moonMeanLon.result + seasonCorrection.result);

  // ── Step 5: Moon maslul (anomaly on galgal katan) ──
  const moonMaslul = calculateMoonMaslul(days);

  // ── Step 6: Double elongation (merchak kaful) — KH 15:1-2 ──
  const doubleElong = calculateDoubleElongation(adjustedMoonMeanLon, sunMeanLon.result);

  // ── Step 7: Maslul hanachon (corrected course) — KH 15:3 ──
  const maslulHanachon = calculateMaslulHanachon(moonMaslul.result, doubleElong.result);

  // ── Step 8: Moon maslul correction from MOON table — KH 15:4-6 ──
  const moonCorrection = lookupMoonMaslulCorrection(maslulHanachon.result);

  // ── Step 9: Moon true longitude — KH 15:4 ──
  const moonTrueLon = calculateMoonTrueLongitude(
    adjustedMoonMeanLon,
    maslulHanachon.result,
    moonCorrection.result,
    moonCorrection.direction,
  );

  // ── Step 10: Node position (rosh) — KH 16:2-3 ──
  const nodePos = calculateNodePosition(days);

  // ── Step 11: Moon latitude — KH 16:9-10 ──
  const moonLat = calculateMoonLatitude(moonTrueLon.result, nodePos.result);

  // ── Step 12: Visibility calculations ──
  const elongation = calculateElongation(moonTrueLon.result, sunTrueLon.result);
  const moonPhase = calculateMoonPhase(elongation.result);
  const firstVisAngle = calculateFirstVisibilityAngle(elongation.result, moonLat.result);
  const visibility = determineVisibility(firstVisAngle.result, elongation.result, moonLat.result);

  // ── Step 13: Season info ──
  const season = calculateSeasonalInfo(days);

  // Helper: get constellation from longitude
  const getConstellation = (lon) => {
    const idx = Math.floor(lon / 30);
    return {
      hebrew: CONSTANTS.CONSTELLATIONS[idx],
      english: CONSTANTS.CONSTELLATION_NAMES_EN[idx],
      positionInConstellation: lon % 30,
    };
  };

  // Ordered steps for drill-down display
  const steps = [
    epochStep,
    // --- Sun chain ---
    sunDailyMotion,
    sunMeanLon,
    sunApogee,
    sunMaslul,
    sunCorrection,
    sunTrueLon,
    // --- Moon chain ---
    moonMeanLon,
    seasonCorrection,
    moonMaslul,
    doubleElong,
    maslulHanachon,
    moonCorrection,
    moonTrueLon,
    nodePos,
    moonLat,
    // --- Visibility ---
    elongation,
    moonPhase,
    firstVisAngle,
    visibility,
    season,
  ];

  // Build a lookup map by step ID
  const stepMap = {};
  for (const step of steps) {
    stepMap[step.id] = step;
  }

  return {
    steps,
    stepMap,
    daysFromEpoch: days,

    sun: {
      meanLongitude: sunMeanLon.result,
      trueLongitude: sunTrueLon.result,
      apogee: sunApogee.result,
      maslul: sunMaslul.result,
      maslulCorrection: sunCorrection.result,
      constellation: getConstellation(sunTrueLon.result),
    },

    moon: {
      meanLongitude: moonMeanLon.result,
      adjustedMeanLongitude: adjustedMoonMeanLon,
      trueLongitude: moonTrueLon.result,
      maslul: moonMaslul.result,
      doubleElongation: doubleElong.result,
      maslulHanachon: maslulHanachon.result,
      maslulCorrection: moonCorrection.result,
      latitude: moonLat.result,
      nodePosition: nodePos.result,
      constellation: getConstellation(moonTrueLon.result),
      phase: moonPhase.result,
      phaseHebrew: moonPhase.hebrewResult,
      elongation: elongation.result,
      firstVisibilityAngle: firstVisAngle.result,
      isVisible: visibility.result,
      illumination: (1 - Math.cos(elongation.result * Math.PI / 180)) / 2,
    },

    season: season.result,
  };
}

/**
 * Legacy-compatible wrapper that returns the same format as the old getAstronomicalData.
 * Used by existing components during migration.
 */
export function getAstronomicalData(date) {
  const calc = getFullCalculation(date);
  return {
    sun: {
      meanLongitude: calc.sun.meanLongitude,
      trueLongitude: calc.sun.trueLongitude,
      apogee: calc.sun.apogee,
      maslul: calc.sun.maslul,
      maslulCorrection: calc.sun.maslulCorrection,
      constellation: calc.sun.constellation.hebrew,
      constellationEnglish: calc.sun.constellation.english,
      positionInConstellation: calc.sun.constellation.positionInConstellation,
    },
    moon: {
      meanLongitude: calc.moon.meanLongitude,
      correctedLongitude: calc.moon.trueLongitude,
      latitude: calc.moon.latitude,
      maslul: calc.moon.maslul,
      maslulCorrection: calc.moon.maslulCorrection,
      doubleElongation: calc.moon.doubleElongation,
      maslulHanachon: calc.moon.maslulHanachon,
      nodePosition: calc.moon.nodePosition,
      elongation: calc.moon.elongation,
      firstVisibilityAngle: calc.moon.firstVisibilityAngle,
      isVisible: calc.moon.isVisible,
      phase: calc.moon.phase,
      constellation: calc.moon.constellation.hebrew,
      constellationEnglish: calc.moon.constellation.english,
      positionInConstellation: calc.moon.constellation.positionInConstellation,
    },
    season: calc.season,
    _steps: calc.steps,
    _stepMap: calc.stepMap,
  };
}
