/**
 * Turning positions on the circle into positions over the horizon.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **modern** — real-sky frame conversion, NOT the Rambam
 *  SURFACE CATEGORY: internal lib (comparison / visualization only)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The book's positions are all angles round the sun's road. A reader
 * asked to see them the way you would from a window: a horizon, the
 * belt crossing it at its evening slant, the sun a little below, the
 * moon where it hangs. That takes a frame conversion — ecliptic
 * longitude and latitude to altitude and azimuth over Jerusalem — and
 * the conversion is modern spherical astronomy, so it lives here in
 * lib/ and every surface using it must say whose it is.
 *
 * The positions FED to it can be the engine's (the Rambam's sun and
 * moon); the frame they are drawn into is the real sky's. That mix is
 * the whole point of the window view, and it is a "crossing" surface
 * by this project's tagging.
 *
 * Accuracy target: half a degree, matching everything else in
 * modernAstronomy.js. GMST is the standard short formula; obliquity is
 * fixed at the modern mean value. Both are pinned in skyView.test.js —
 * including a cross-check that at localObserver's computed sunset the
 * real sun sits at the horizon-refraction altitude, which ties this
 * module and that one to each other.
 */
import { toJulianDay } from './modernAstronomy';

const DEG = Math.PI / 180;
const OBLIQUITY = 23.4393;

/** Greenwich mean sidereal time, in degrees [0, 360). */
export function gmstDeg(jd) {
  const t = jd - 2451545.0;
  return ((280.46061837 + 360.98564736629 * t) % 360 + 360) % 360;
}

/** Local sidereal time for an east-positive longitude, degrees. */
export function lstDeg(jd, longitudeEast) {
  return ((gmstDeg(jd) + longitudeEast) % 360 + 360) % 360;
}

/** Ecliptic (λ, β) → equatorial (α right ascension, δ declination), degrees. */
export function eclipticToEquatorial(lambda, beta = 0) {
  const l = lambda * DEG;
  const b = beta * DEG;
  const e = OBLIQUITY * DEG;
  const alpha = Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l),
  );
  const delta = Math.asin(
    Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l),
  );
  return { ra: ((alpha / DEG) % 360 + 360) % 360, dec: delta / DEG };
}

/** Equatorial → horizontal for an observer. Azimuth from north, through east. */
export function equatorialToHorizontal(ra, dec, jd, observer) {
  const H = (lstDeg(jd, observer.longitude) - ra) * DEG; // hour angle
  const phi = observer.latitude * DEG;
  const d = dec * DEG;
  const alt = Math.asin(
    Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H),
  );
  const az = Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(d) * Math.cos(phi),
  );
  // atan2 form above measures azimuth from SOUTH, westward; convert to
  // the compass convention (from north, through east).
  return {
    altitude: alt / DEG,
    azimuth: ((az / DEG + 180) % 360 + 360) % 360,
  };
}

/** One call: ecliptic position → where it stands over the horizon. */
export function skyPosition(lambda, beta, jd, observer) {
  const { ra, dec } = eclipticToEquatorial(lambda, beta);
  return equatorialToHorizontal(ra, dec, jd, observer);
}

/** Julian day for a civil date at a given UTC hour. */
export function jdAt(date, utcHours) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
  return toJulianDay(d) + utcHours / 24;
}
