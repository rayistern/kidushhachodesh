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
 * The criterion is deliberately elongation-only. A full modern sighting
 * forecast (Yallop, Odeh) also weighs crescent width and the moon's
 * altitude above the sun; "likely" here is the generous end of modern
 * practice, and the surfaces say so.
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
  };
}
