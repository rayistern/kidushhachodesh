import { CONSTANTS } from '../constants';

/* ----------------  helpers (copied from AstronomicalCalculations.js) -------- */
const calculateLunarLatitude = (daysFromBase) => {
  const latitudeCycle = 27.32166;          // draconic month
  const maxLatitude   = 5.0;               // deg
  const phase = (daysFromBase % latitudeCycle) / latitudeCycle;
  return maxLatitude * Math.sin(2 * Math.PI * phase);
};

const calculateFirstVisibility = (elongation, latitude) =>
  elongation + 0.3 * Math.abs(latitude);

const calculateSeasonalInfo = (daysFromBase) => {
  const solarYear = 365.25;
  const seasonLen = solarYear / 4;
  const yearPos   = (daysFromBase % solarYear) / solarYear;
  const dayInYear = Math.floor(daysFromBase % solarYear);

  const seasonIdx = Math.floor(yearPos * 4);          // 0-3
  const seasonArr = ['Spring', 'Summer', 'Fall', 'Winter'];
  return {
    currentSeason: seasonArr[seasonIdx],
    daysUntilNextSeason: Math.ceil(seasonLen - (dayInYear % seasonLen))
  };
};
/* --------------------------------------------------------------------------- */

export function getAstronomicalData(date) {
  const baseDate     = CONSTANTS.BASE_DATE;
  const daysFromBase = Math.floor((date - baseDate) / 8.64e7); // ms → days

  /* ---------- SUN -------------- */
  const sunMeanMotionDeg =
      CONSTANTS.SUN.MEAN_MOTION_PER_DAY.degrees +
      CONSTANTS.SUN.MEAN_MOTION_PER_DAY.minutes / 60 +
      CONSTANTS.SUN.MEAN_MOTION_PER_DAY.seconds / 3600;

  const sunMeanLon =
      (CONSTANTS.SUN.START_POSITION.degrees +
       CONSTANTS.SUN.START_POSITION.minutes / 60 +
       CONSTANTS.SUN.START_POSITION.seconds / 3600 +
       sunMeanMotionDeg * daysFromBase) % 360;

  const apogeeStart =
      CONSTANTS.SUN.APOGEE_START.degrees +
      CONSTANTS.SUN.APOGEE_CONSTELLATION * 30;

  const apogeePos =
      (apogeeStart +
       CONSTANTS.SUN.APOGEE_MOTION_PER_DAY * daysFromBase) % 360;

  let sunMaslul = sunMeanLon - apogeePos;
  if (sunMaslul < 0) sunMaslul += 360;

  /*  maslul-correction (linear interpolation)  */
  let sunMaslulCorr = 0;
  for (let i = 0; i < CONSTANTS.MASLUL_CORRECTIONS.length - 1; i++) {
    const cur = CONSTANTS.MASLUL_CORRECTIONS[i];
    const nxt = CONSTANTS.MASLUL_CORRECTIONS[i + 1];
    if (sunMaslul >= cur.maslul && sunMaslul < nxt.maslul) {
      const r = (sunMaslul - cur.maslul) / (nxt.maslul - cur.maslul);
      sunMaslulCorr = cur.correction + r * (nxt.correction - cur.correction);
      break;
    }
  }
  const sunTrueLon =
      (sunMaslul <= 180)
        ? (sunMeanLon + sunMaslulCorr) % 360
        : (sunMeanLon - sunMaslulCorr + 360) % 360;

  /* ---------- MOON -------------- */
  const moonMeanLon =
      (CONSTANTS.MOON.START_POSITION.degrees +
       CONSTANTS.MOON.MEAN_MOTION_PER_DAY.degrees * daysFromBase) % 360;

  const moonMaslul =
      (CONSTANTS.MOON.MASLUL_START.degrees +
       CONSTANTS.MOON.MASLUL_MEAN_MOTION.degrees * daysFromBase) % 360;

  let moonMaslulCorr = 0;
  for (let i = 0; i < CONSTANTS.MASLUL_CORRECTIONS.length - 1; i++) {
    const cur = CONSTANTS.MASLUL_CORRECTIONS[i];
    const nxt = CONSTANTS.MASLUL_CORRECTIONS[i + 1];
    if (moonMaslul >= cur.maslul && moonMaslul < nxt.maslul) {
      const r = (moonMaslul - cur.maslul) / (nxt.maslul - cur.maslul);
      moonMaslulCorr = cur.correction + r * (nxt.correction - cur.correction);
      break;
    }
  }

  const lunarLat  = calculateLunarLatitude(daysFromBase);
  const moonTrueLon = (moonMeanLon + moonMaslulCorr) % 360;

  const elong = (moonTrueLon - sunTrueLon + 360) % 360;
  const firstVis = calculateFirstVisibility(elong, lunarLat);
  const visible  = firstVis > 12;

  let phase = '';
  if (elong < 90) phase = 'Waxing Crescent';
  else if (elong < 180) phase = 'Waxing Gibbous';
  else if (elong < 270) phase = 'Waning Gibbous';
  else phase = 'Waning Crescent';

  return {
    sun : {
      meanLongitude   : sunMeanLon.toFixed(2),
      trueLongitude   : sunTrueLon.toFixed(2),
      apogee          : apogeePos.toFixed(2),
      maslul          : sunMaslul.toFixed(2),
      maslulCorrection: sunMaslulCorr.toFixed(2),
      constellation   : CONSTANTS.CONSTELLATIONS[Math.floor(sunMeanLon / 30)],
      positionInConstellation: (sunMeanLon % 30).toFixed(2)
    },
    moon: {
      meanLongitude      : moonMeanLon.toFixed(2),
      correctedLongitude : moonTrueLon.toFixed(2),
      latitude           : lunarLat.toFixed(2),
      maslul             : moonMaslul.toFixed(2),
      maslulCorrection   : moonMaslulCorr.toFixed(2),
      elongation         : elong.toFixed(2),
      firstVisibilityAngle: firstVis.toFixed(2),
      isVisible          : visible,
      phase,
      constellation      : CONSTANTS.CONSTELLATIONS[Math.floor(moonTrueLon / 30)],
      positionInConstellation: (moonTrueLon % 30).toFixed(2)
    },
    season: calculateSeasonalInfo(daysFromBase)
  };
}

/* convenience exports */
export const getMoonPosition = (date) => getAstronomicalData(date).moon;
export const getSunPosition  = (date) => getAstronomicalData(date).sun; 