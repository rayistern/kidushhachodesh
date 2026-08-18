/**
 * A modern reference position for the sun, for comparison only.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **outside** — this is NOT the Rambam and NOT the engine.
 *  SURFACE CATEGORY: reference (comparison surface)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Nothing in the calculation pipeline may import this. It exists so the
 * reading surfaces can answer "and where is the sun actually?" beside
 * the Rambam's answer, never to correct or replace his method. The
 * engine implements KH 11-17; this file implements Meeus.
 *
 * ── Algorithm and accuracy ──
 * Meeus, *Astronomical Algorithms* 2nd ed., chapter 25, the "lower
 * accuracy" solar position. Returns the sun's true geometric longitude
 * referred to the mean equinox of date — a **tropical** longitude,
 * measured from the vernal equinox point of that moment.
 *
 * Meeus gives this method an accuracy of about 0.01° (36"). The
 * differences it is used to display here are of order half a degree, so
 * the method's own error is ~2% of the quantity being reported. Pinned
 * against Meeus's own worked example 25.a in modernAstronomy.test.js.
 *
 * Omitted deliberately: nutation and aberration, together under 0.006°,
 * which would be false precision at this scale.
 *
 * ── The frame question, which is the whole reason a comparison works ──
 * Over the 848 years since the Rambam's epoch, precession moves the
 * vernal equinox roughly 11.8° against the fixed stars. So a sidereal
 * longitude and a tropical one drift apart by that much, and comparing
 * the wrong pair would manufacture a 12° "error" out of nothing.
 *
 * Empirically the Rambam's longitudes track the tropical sun to within
 * a bounded half-degree across the whole span — see the fixtures in the
 * test file — which is what identifies his frame as tropical. That is a
 * measured result, not an assumption imported from elsewhere.
 *
 * ── The time-of-day caveat ──
 * The sun moves about 2.5' of arc per hour, so the instant chosen for a
 * comparison matters at the ~0.1° level. The Rambam's positions are for
 * nightfall in Jerusalem; `nightfallUTC` builds that instant, and the
 * residual convention uncertainty is stated wherever a difference is
 * displayed.
 */

const DEG = Math.PI / 180;

/** Julian Day from a JS Date. */
export function toJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * The sun's true geometric longitude, in degrees [0, 360), referred to
 * the mean equinox of date.
 */
export function modernSunLongitude(date) {
  const T = (toJulianDay(date) - 2451545.0) / 36525;

  // Geometric mean longitude of the sun.
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  // Mean anomaly.
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * DEG;
  // Equation of the centre.
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);

  return normalize(L0 + C);
}

/**
 * Approximate nightfall in Jerusalem for a civil date, as a UTC instant.
 *
 * The Rambam anchors his positions to the beginning of the night, and
 * Jerusalem sits about 2h21m east of Greenwich in mean solar time. This
 * is a fixed-hour approximation, not a real sunset calculation — actual
 * sunset there swings roughly 17:00 to 19:50 local across the year, so
 * this carries up to ~1.5h of error, which is ~4' of solar longitude.
 * That is an order of magnitude below the differences being displayed,
 * but it is why those differences are reported to a tenth of a degree
 * and no finer.
 */
export function nightfallUTC(year, month, day) {
  const JERUSALEM_LMT_OFFSET_HOURS = 2 + 21 / 60;
  const NIGHTFALL_LOCAL_HOUR = 18.5;
  const utcHour = NIGHTFALL_LOCAL_HOUR - JERUSALEM_LMT_OFFSET_HOURS;
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + utcHour * 3600000);
}

/** Signed difference a − b, folded into (−180, 180]. */
export function angularDifference(a, b) {
  return ((a - b + 540) % 360) - 180;
}

/**
 * Jerusalem's sunset for a day of the year, in hours of local solar
 * time. Comparison only, like everything else in this file.
 *
 * Used to show *why* KH 14:5 exists. The Rambam wants the moon's
 * position twenty minutes after sunset (14:6), sunset slides through
 * the year, and so the position wanted slides with it. That reading is
 * editorial — he gives no reason for the table — and any surface using
 * this must say so.
 *
 * NOAA's low-accuracy sunset algorithm: good to about a minute, which
 * is far finer than the effect being illustrated.
 */
export function jerusalemSunsetHours(dayOfYear) {
  const LATITUDE = 31.78 * DEG;
  const ZENITH = 90.833 * DEG; // sun's disc + refraction at the horizon

  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const declination =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g)); // minutes

  const cosHourAngle =
    (Math.cos(ZENITH) - Math.sin(LATITUDE) * Math.sin(declination)) /
    (Math.cos(LATITUDE) * Math.cos(declination));
  // Jerusalem never sees a polar day or night, so the argument stays in
  // range; clamp anyway rather than return NaN if this is ever reused.
  const hourAngle = Math.acos(Math.min(1, Math.max(-1, cosHourAngle))) / DEG;

  return 12 + hourAngle / 15 - equationOfTime / 60;
}

/** Mean of `jerusalemSunsetHours` across the year — the "average sunset". */
export function meanJerusalemSunsetHours() {
  let total = 0;
  for (let d = 1; d <= 365; d++) total += jerusalemSunsetHours(d);
  return total / 365;
}

function normalize(deg) {
  return ((deg % 360) + 360) % 360;
}

/**
 * The real moon's ecliptic position — COMPARISON ONLY, like everything
 * in this file. Never feeds a verdict.
 *
 * Truncated from Meeus, Astronomical Algorithms ch. 47: every periodic
 * term of 0.01° or larger (19 in longitude, 14 in latitude). The full
 * series is good to arcseconds; this truncation is good to about 0.05°,
 * pinned in modernAstronomy.test.js against Meeus's own worked example
 * (47.a) and against a known new-moon instant.
 *
 * Added 2026-08-18 for the /sky page's "show the real sky" toggle. The
 * project's long-standing "no lunar ephemeris" stance was about the
 * VERDICT path, which remains pure KH 11-17; the claims on the surfaces
 * that said it were narrowed the same day.
 */
export function modernMoonPosition(date) {
  const T = (toJulianDay(date) - 2451545.0) / 36525;
  const norm = (d) => ((d % 360) + 360) % 360;
  // Mean elements (degrees), Meeus 47.1-47.5.
  const Lp = norm(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
  const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const F = norm(93.272095 + 483202.0175233 * T - 0.0036539 * T * T);
  const DEG = Math.PI / 180;
  const E = 1 - 0.002516 * T; // eccentricity damping for terms with M
  const s = (k) => Math.sin(k * DEG);

  // [coeff°, d, m, mp, f] — longitude terms ≥ 0.01°.
  const LON = [
    [6.288774, 0, 0, 1, 0], [1.274027, 2, 0, -1, 0], [0.658314, 2, 0, 0, 0],
    [0.213618, 0, 0, 2, 0], [-0.185116, 0, 1, 0, 0], [-0.114332, 0, 0, 0, 2],
    [0.058793, 2, 0, -2, 0], [0.057066, 2, -1, -1, 0], [0.053322, 2, 0, 1, 0],
    [0.045758, 2, -1, 0, 0], [-0.040923, 0, 1, -1, 0], [-0.034720, 1, 0, 0, 0],
    [-0.030383, 0, 1, 1, 0], [0.015327, 2, 0, 0, -2], [-0.012528, 0, 0, 1, 2],
    [0.010980, 0, 0, 1, -2], [0.010675, 4, 0, -1, 0], [0.010034, 0, 0, 3, 0],
    [0.008548, 4, 0, -2, 0],
  ];
  // Latitude terms ≥ 0.01°.
  const LAT = [
    [5.128122, 0, 0, 0, 1], [0.280602, 0, 0, 1, 1], [0.277693, 0, 0, 1, -1],
    [0.173237, 2, 0, 0, -1], [0.055413, 2, 0, -1, 1], [0.046271, 2, 0, -1, -1],
    [0.032573, 2, 0, 0, 1], [0.017198, 0, 0, 2, 1], [0.009266, 2, 0, 1, -1],
    [0.008822, 0, 0, 2, -1], [0.008216, 2, -1, 0, -1], [0.004324, 0, 0, 2, -3],
    [0.004200, 2, 0, 1, 1], [-0.003359, 2, 1, 0, -1],
  ];
  const sum = (terms) =>
    terms.reduce((acc, [c, d, m, mp, f]) => {
      const e = m === 0 ? 1 : m === 1 || m === -1 ? E : E * E;
      return acc + c * e * s(d * D + m * M + mp * Mp + f * F);
    }, 0);

  return { longitude: norm(Lp + sum(LON)), latitude: sum(LAT) };
}
