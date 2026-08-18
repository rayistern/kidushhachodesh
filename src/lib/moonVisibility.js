/**
 * A modern first-crescent visibility check — COMPARISON ONLY.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **modern** — real astronomy, NOT the Rambam
 *  SURFACE CATEGORY: internal lib (comparison only)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The engine's verdict is KH 17's and nothing else; this module exists
 * so a surface can put the modern question beside it: has conjunction
 * actually happened, has the moon actually opened 7° from the sun (the
 * Danjon limit — the least elongation at which a naked eye has ever
 * caught a crescent), and does the moon actually set late enough after
 * the sun to leave a window? Nothing here may feed a verdict.
 *
 * Everything is built from the two comparison modules that already
 * exist: modernAstronomy's Meeus sun and moon (good to ~0.05° for the
 * moon, so times found by inverting it carry ~5-10 minutes), and
 * skyView's frame conversion for the moonset search.
 *
 * Two criteria, coarse then full. The elongation gate (Danjon limit)
 * answers whether a crescent EXISTS to look for; Yallop's q-test —
 * the arc of vision against the crescent's width at "best time",
 * fitted to 295 recorded sightings (Yallop 1997, NAO TN 69) — answers
 * whether an eye would actually catch it, in bands A (easy) through F
 * (below the Danjon limit). Geocentric altitudes without refraction,
 * as Yallop's formulation takes them; the atmosphere itself (cloud,
 * dust, haze) is outside every criterion here.
 *
 * Cross-checked in moonVisibility.test.js against an independently
 * generated table (Meeus ch. 49 conjunctions verified against
 * timeanddate.com).
 */
import { modernSunLongitude, modernMoonPosition } from './modernAstronomy';
import { skyPosition, jdAt } from './skyView';
import { sunsetUtcHours } from './localObserver';

/** The Danjon limit: least sun-moon elongation ever sighted naked-eye. */
export const DANJON_LIMIT_DEG = 7;

const HOUR_MS = 3600000;

/** Signed moon−sun elongation in ecliptic longitude, folded to (−180, 180]. */
export function signedElongation(date) {
  const moon = modernMoonPosition(date).longitude;
  const sun = modernSunLongitude(date);
  return ((moon - sun + 540) % 360) - 180;
}

/**
 * The conjunction nearest `date` — the −→+ zero crossing of the signed
 * elongation — or null if none falls within ±4 days. Hourly scan, then
 * bisection to well under a minute (the underlying series is only good
 * to ~5-10 minutes, so the answer's precision outruns its accuracy).
 */
export function conjunctionNear(date) {
  const t0 = date.getTime() - 4 * 24 * HOUR_MS;
  let prev = signedElongation(new Date(t0));
  for (let h = 1; h <= 8 * 24; h++) {
    const t = t0 + h * HOUR_MS;
    const cur = signedElongation(new Date(t));
    if (prev < 0 && cur >= 0 && cur < 90) {
      let lo = t - HOUR_MS;
      let hi = t;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (signedElongation(new Date(mid)) < 0) lo = mid;
        else hi = mid;
      }
      return new Date((lo + hi) / 2);
    }
    prev = cur;
  }
  return null;
}

/**
 * The first instant at or after `from` when the elongation reaches
 * `deg`. Meant for small targets (the 7° limit) shortly after a
 * conjunction, where the elongation climbs monotonically at ~0.5°/hour.
 */
export function elongationReaches(from, deg) {
  let t = from.getTime();
  let guard = 0;
  while (signedElongation(new Date(t)) < deg && guard++ < 96) t += HOUR_MS;
  let lo = t - HOUR_MS;
  let hi = t;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (signedElongation(new Date(mid)) < deg) lo = mid;
    else hi = mid;
  }
  return new Date((lo + hi) / 2);
}

/**
 * When the moon sets on the evening of `eveDate`, in UTC hours — or
 * null if it doesn't between 2h before and 8h after sunset. Crossing of
 * geocentric altitude +0.125°, the standard moonset figure (mean
 * horizontal parallax less refraction and semidiameter, Meeus ch. 15);
 * 5-minute scan, bisected to under a minute. Worth ± a few minutes: the
 * parallax term is a mean, and the horizon is assumed clear and flat.
 */
export function moonsetUtcHours(eveDate, observer) {
  const sunset = sunsetUtcHours(eveDate, observer);
  if (sunset == null) return null;
  const midnightUtc = Date.UTC(eveDate.getFullYear(), eveDate.getMonth(), eveDate.getDate(), 0, 0, 0);
  const altAt = (utcHours) => {
    const pos = modernMoonPosition(new Date(midnightUtc + utcHours * HOUR_MS));
    return skyPosition(pos.longitude, pos.latitude, jdAt(eveDate, utcHours), observer).altitude - 0.125;
  };
  const STEP = 5 / 60;
  let prev = altAt(sunset - 2);
  for (let u = sunset - 2 + STEP; u <= sunset + 8 + 1e-9; u += STEP) {
    const cur = altAt(u);
    if (prev > 0 && cur <= 0) {
      let lo = u - STEP;
      let hi = u;
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        if (altAt(mid) > 0) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }
    prev = cur;
  }
  return null;
}

/**
 * The moon's distance in km — Meeus ch. 47's ΣR, truncated to terms of
 * 10 km and larger (good to ~±30 km, which moves the crescent width by
 * far less than the q-test can resolve). The mean elements mirror
 * modernMoonPosition's; only the cosine series differs.
 */
export function moonDistanceKm(date) {
  const T = ((date.getTime() / 86400000 + 2440587.5) - 2451545.0) / 36525;
  const norm = (d) => ((d % 360) + 360) % 360;
  const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const F = norm(93.272095 + 483202.0175233 * T - 0.0036539 * T * T);
  const DEG = Math.PI / 180;
  const E = 1 - 0.002516 * T;
  // [coeff (m), d, m, mp, f] — distance terms ≥ 10 km, Meeus table 47.A.
  const R = [
    [-20905355, 0, 0, 1, 0], [-3699111, 2, 0, -1, 0], [-2955968, 2, 0, 0, 0],
    [-569925, 0, 0, 2, 0], [48888, 0, 1, 0, 0], [-3149, 0, 0, 0, 2],
    [246158, 2, 0, -2, 0], [-152138, 2, -1, -1, 0], [-170733, 2, 0, 1, 0],
    [-204586, 2, -1, 0, 0], [-129620, 0, 1, -1, 0], [108743, 1, 0, 0, 0],
    [104755, 0, 1, 1, 0], [10321, 2, 0, 0, -2], [79661, 0, 0, 1, -2],
    [-34782, 4, 0, -1, 0], [-23210, 0, 0, 3, 0], [-21636, 4, 0, -2, 0],
    [24208, 2, 1, -1, 0], [30824, 2, 1, 0, 0], [-16675, 1, 1, 0, 0],
    [-12831, 2, -1, 1, 0], [-10445, 2, 0, 2, 0], [-11650, 4, 0, 0, 0],
    [14403, 2, 0, -3, 0],
  ];
  const sum = R.reduce((acc, [c, d, m, mp, f]) => {
    const e = m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E;
    return acc + c * e * Math.cos((d * D + m * M + mp * Mp + f * F) * DEG);
  }, 0);
  return 385000.56 + sum / 1000;
}

/**
 * Yallop's q-test for one evening (NAO Technical Note 69, 1997) — the
 * full modern criterion, fitted to 295 recorded first sightings.
 *
 * At "best time" (sunset + 4/9 of the sunset-to-moonset lag): ARCV is
 * the arc of vision, the moon's altitude above the sun's; ARCL the arc
 * of light, the true angular separation; W' the crescent's width in
 * arcminutes, the lune's thickness SD·(1 − cos ARCL). Then
 *
 *   q = (ARCV − (11.8371 − 6.3226·W' + 0.7319·W'² − 0.1018·W'³)) / 10
 *
 * read against Yallop's bands:
 *   A  q > +0.216   easily visible to the naked eye
 *   B  q > −0.014   visible in perfect conditions
 *   C  q > −0.160   may need optical aid to FIND, then naked-eye
 *   D  q > −0.232   needs optical aid throughout
 *   E  q > −0.293   not visible even with a telescope
 *   F  below        not visible; under the Danjon limit
 *
 * Returns null when the moon is down by sunset (no lag to take 4/9 of):
 * the q-test is a dusk criterion and has nothing to say about a
 * daylight-only window.
 */
export function yallopFor(eveDate, observer) {
  const sunsetUtc = sunsetUtcHours(eveDate, observer);
  const moonsetUtc = moonsetUtcHours(eveDate, observer);
  if (sunsetUtc == null || moonsetUtc == null) return null;
  const lagHours = moonsetUtc - sunsetUtc;
  if (lagHours <= 0) return null;
  const bestUtc = sunsetUtc + (4 / 9) * lagHours;
  const midnightUtc = Date.UTC(eveDate.getFullYear(), eveDate.getMonth(), eveDate.getDate(), 0, 0, 0);
  const instant = new Date(midnightUtc + bestUtc * HOUR_MS);
  const jd = jdAt(eveDate, bestUtc);
  const moon = modernMoonPosition(instant);
  const sunLon = modernSunLongitude(instant);
  const moonH = skyPosition(moon.longitude, moon.latitude, jd, observer);
  const sunH = skyPosition(sunLon, 0, jd, observer);
  const DEG = Math.PI / 180;
  const dLon = ((moon.longitude - sunLon + 540) % 360) - 180;
  const arcl = Math.acos(Math.cos(moon.latitude * DEG) * Math.cos(dLon * DEG)) / DEG;
  const arcv = moonH.altitude - sunH.altitude;
  const sdArcmin = (1737.4 / moonDistanceKm(instant)) * (180 / Math.PI) * 60;
  const wPrime = sdArcmin * (1 - Math.cos(arcl * DEG));
  const q = (arcv - (11.8371 - 6.3226 * wPrime + 0.7319 * wPrime ** 2 - 0.1018 * wPrime ** 3)) / 10;
  const code = q > 0.216 ? 'A' : q > -0.014 ? 'B' : q > -0.16 ? 'C' : q > -0.232 ? 'D' : q > -0.293 ? 'E' : 'F';
  return { bestUtc, lagMinutes: Math.round(lagHours * 60), arcv, arcl, wPrime, q, code };
}

/**
 * The whole modern question for one evening, answered at once.
 *
 * Verdict keys, in the order the evening's facts eliminate them:
 *   'not-crescent-night' — the moon is nowhere near a first crescent
 *   'no-crescent-yet'    — conjunction is after sunset this evening
 *   'daylight-only'      — 7° reached, but the moon sets BEFORE the sun
 *   'impossible'         — the moon sets before reaching 7°
 *   'likely'             — 7° passed before sunset, moon still up after
 *   'challenging'        — 7° reached between sunset and moonset
 *   'indeterminate'      — no moonset found to test against
 */
export function assessEvening(eveDate, observer) {
  const sunsetUtc = sunsetUtcHours(eveDate, observer);
  if (sunsetUtc == null) return null;
  const midnightUtc = Date.UTC(eveDate.getFullYear(), eveDate.getMonth(), eveDate.getDate(), 0, 0, 0);
  const sunsetInstant = new Date(midnightUtc + sunsetUtc * HOUR_MS);
  const elongationAtSunset = signedElongation(sunsetInstant);
  const moonsetUtc = moonsetUtcHours(eveDate, observer);
  const conjunction = conjunctionNear(sunsetInstant);
  const sevenDeg = conjunction ? elongationReaches(conjunction, DANJON_LIMIT_DEG) : null;

  let verdict;
  if (elongationAtSunset > 40 || elongationAtSunset < -25) {
    verdict = 'not-crescent-night';
  } else if (elongationAtSunset < 0) {
    verdict = 'no-crescent-yet';
  } else if (moonsetUtc == null) {
    verdict = 'indeterminate';
  } else {
    const atMoonset = signedElongation(new Date(midnightUtc + moonsetUtc * HOUR_MS));
    if (atMoonset < DANJON_LIMIT_DEG) verdict = 'impossible';
    else if (moonsetUtc <= sunsetUtc) verdict = 'daylight-only';
    else if (elongationAtSunset >= DANJON_LIMIT_DEG) verdict = 'likely';
    else verdict = 'challenging';
  }

  return {
    sunsetUtc,
    moonsetUtc,
    windowMinutes: moonsetUtc != null ? Math.round((moonsetUtc - sunsetUtc) * 60) : null,
    conjunction,
    sevenDeg,
    elongationAtSunset,
    verdict,
    // The full criterion, where it applies: a crescent-shaped evening
    // with the moon still up at sunset.
    yallop:
      elongationAtSunset >= 0 && elongationAtSunset <= 40 ? yallopFor(eveDate, observer) : null,
  };
}
