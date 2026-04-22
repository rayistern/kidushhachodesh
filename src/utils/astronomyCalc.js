/**
 * Thin compatibility wrapper over the engine pipeline.
 *
 * Historical note: this file used to be a parallel (and subtly buggy)
 * implementation of the Rambam's calculations — notably it inverted the
 * sun's correction-direction rule and used the sun's correction table
 * for the moon. It also bypassed the Hebrew-native day count.
 *
 * Rather than maintain two pipelines, this now delegates to the engine
 * and keeps the string-formatted shape that existing consumers
 * (CelestialVisualization, AstronomicalCalculations) already expect.
 */
import { getAstronomicalData as engineGetAstronomicalData } from '../engine/pipeline.js';
import { daysFromEpoch } from '../engine/epochDays.js';

const fmt = (n) => (typeof n === 'number' ? n.toFixed(2) : n);

export function getAstronomicalData(date) {
  const engine = engineGetAstronomicalData(date);
  const days = daysFromEpoch(date);

  return {
    sun: {
      meanLongitude: fmt(engine.sun.meanLongitude),
      trueLongitude: fmt(engine.sun.trueLongitude),
      apogee: fmt(engine.sun.apogee),
      maslul: fmt(engine.sun.maslul),
      maslulCorrection: fmt(engine.sun.maslulCorrection),
      constellation: engine.sun.constellation,
      positionInConstellation: fmt(engine.sun.positionInConstellation),
    },
    moon: {
      meanLongitude: fmt(engine.moon.meanLongitude),
      correctedLongitude: fmt(engine.moon.correctedLongitude),
      latitude: fmt(engine.moon.latitude),
      maslul: fmt(engine.moon.maslul),
      maslulCorrection: fmt(engine.moon.maslulCorrection),
      elongation: fmt(engine.moon.elongation),
      firstVisibilityAngle: fmt(engine.moon.firstVisibilityAngle),
      isVisible: engine.moon.isVisible,
      phase: engine.moon.phase,
      constellation: engine.moon.constellation,
      positionInConstellation: fmt(engine.moon.positionInConstellation),
    },
    season: {
      currentSeason: engine.season?.currentSeason ?? '',
      daysUntilNextSeason: engine.season?.daysUntilNextSeason ?? 0,
    },
    _daysFromEpoch: days,
  };
}

export const getMoonPosition = (date) => getAstronomicalData(date).moon;
export const getSunPosition = (date) => getAstronomicalData(date).sun;
