/**
 * Calculation pipeline — orchestrates all astronomical calculations
 * for a given date and returns the full chain of CalculationSteps.
 */
import { calculateDaysFromEpoch, getSunDailyMotion, calculateSunMeanLongitude, calculateSunApogee, calculateSunMaslul, lookupMaslulCorrection, calculateSunTrueLongitude } from './sunCalculations.js';
import { calculateMoonMeanLongitude, calculateMoonMaslul, lookupMoonMaslulCorrection, calculateMoonTrueLongitude, calculateMoonLatitude, calculateMoonPhase } from './moonCalculations.js';
import { calculateElongation, calculateFirstVisibilityAngle, determineVisibility, calculateSeasonalInfo } from './visibilityCalculations.js';
import { CONSTANTS } from './constants.js';

/**
 * Run all Rambam calculations for a given date.
 * Returns { steps, sun, moon, visibility, season } where:
 *  - steps: ordered array of all CalculationStep objects (for drill-down UI)
 *  - sun/moon/visibility/season: convenience accessors for final values
 */
export function getFullCalculation(date) {
  // Step 1: Days from epoch
  const epochStep = calculateDaysFromEpoch(date);
  const days = epochStep.result;

  // Step 2: Sun calculations
  const sunDailyMotion = getSunDailyMotion();
  const sunMeanLon = calculateSunMeanLongitude(days);
  const sunApogee = calculateSunApogee(days);
  const sunMaslul = calculateSunMaslul(sunMeanLon.result, sunApogee.result);
  const sunCorrection = lookupMaslulCorrection(sunMaslul.result);
  const sunTrueLon = calculateSunTrueLongitude(sunMeanLon.result, sunMaslul.result, sunCorrection.result);

  // Step 3: Moon calculations
  const moonMeanLon = calculateMoonMeanLongitude(days);
  const moonMaslul = calculateMoonMaslul(days);
  const moonCorrection = lookupMoonMaslulCorrection(moonMaslul.result);
  const moonTrueLon = calculateMoonTrueLongitude(moonMeanLon.result, moonMaslul.result, moonCorrection.result);
  const moonLat = calculateMoonLatitude(days);

  // Step 4: Visibility calculations
  const elongation = calculateElongation(moonTrueLon.result, sunTrueLon.result);
  const moonPhase = calculateMoonPhase(elongation.result);
  const firstVisAngle = calculateFirstVisibilityAngle(elongation.result, moonLat.result);
  const visibility = determineVisibility(firstVisAngle.result, elongation.result, moonLat.result);

  // Step 5: Season
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

  // Ordered steps for drill-down
  const steps = [
    epochStep,
    sunDailyMotion,
    sunMeanLon,
    sunApogee,
    sunMaslul,
    sunCorrection,
    sunTrueLon,
    moonMeanLon,
    moonMaslul,
    moonCorrection,
    moonTrueLon,
    moonLat,
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
      trueLongitude: moonTrueLon.result,
      maslul: moonMaslul.result,
      maslulCorrection: moonCorrection.result,
      latitude: moonLat.result,
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
      elongation: calc.moon.elongation,
      firstVisibilityAngle: calc.moon.firstVisibilityAngle,
      isVisible: calc.moon.isVisible,
      phase: calc.moon.phase,
      constellation: calc.moon.constellation.hebrew,
      constellationEnglish: calc.moon.constellation.english,
      positionInConstellation: calc.moon.constellation.positionInConstellation,
    },
    season: calc.season,
    // Expose the full calculation chain for drill-down
    _steps: calc.steps,
    _stepMap: calc.stepMap,
  };
}
