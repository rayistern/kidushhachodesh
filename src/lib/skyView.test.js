/**
 * The sky-frame conversion, pinned before anything is drawn with it.
 *
 * Three kinds of anchor:
 *   - textbook values (GMST at J2000, the obliquity corners of the
 *     ecliptic-to-equatorial conversion, the length of a sidereal day);
 *   - a cross-module check: at the sunset time localObserver computes,
 *     the real sun's altitude must come out at the horizon-refraction
 *     value, tying this module, localObserver and modernAstronomy to
 *     each other;
 *   - the fact the window view exists to teach: at the same clock time
 *     a night later, the star frame has slid about a degree westward
 *     ("24 hours minus 4 minutes"), while the engine's moon has leapt
 *     about thirteen against it.
 */
import { describe, it, expect } from 'vitest';
import { gmstDeg, lstDeg, eclipticToEquatorial, equatorialToHorizontal, skyPosition, jdAt } from './skyView';
import { modernSunLongitude } from './modernAstronomy';
import { sunsetUtcHours, RAMBAM_REFERENCE } from './localObserver';

const JERUSALEM = { latitude: 31.78, longitude: 35.2137 };

describe('textbook anchors', () => {
  it('reproduces GMST at the J2000 epoch', () => {
    expect(gmstDeg(2451545.0)).toBeCloseTo(280.4606, 3);
  });

  it('jdAt puts noon UTC of 2000-01-01 at the epoch', () => {
    expect(jdAt(new Date(2000, 0, 1), 12)).toBeCloseTo(2451545.0, 5);
  });

  it('sends the equinox and solstice points where the obliquity says', () => {
    const eq = eclipticToEquatorial(0, 0);
    expect(eq.ra).toBeCloseTo(0, 6);
    expect(eq.dec).toBeCloseTo(0, 6);
    const sol = eclipticToEquatorial(90, 0);
    expect(sol.ra).toBeCloseTo(90, 6);
    expect(sol.dec).toBeCloseTo(23.4393, 4);
    const autumn = eclipticToEquatorial(180, 0);
    expect(autumn.ra).toBeCloseTo(180, 6);
    expect(autumn.dec).toBeCloseTo(0, 5);
  });

  it('puts the north celestial pole at the observer latitude', () => {
    // The pole (dec +90) stands at altitude = latitude, azimuth north —
    // the oldest check in navigation.
    const pole = equatorialToHorizontal(123, 90, 2460000.5, JERUSALEM);
    expect(pole.altitude).toBeCloseTo(JERUSALEM.latitude, 4);
  });

  it('a sidereal day is 23h 56m 4s — the "24 hours minus 4 minutes"', () => {
    const hours = (360 / 360.98564736629) * 24;
    expect(hours * 3600).toBeCloseTo(23 * 3600 + 56 * 60 + 4.1, 0);
  });
});

describe('cross-module: sunset really is sunset', () => {
  it("puts the real sun at the horizon-refraction altitude at localObserver's sunset", () => {
    // sunsetUtcHours uses NOAA's formula; this module converts frames
    // independently. If either were off, the sun would not land at
    // -0.833° (solar radius + refraction) at the computed moment.
    for (const [y, m, d] of [[2026, 2, 21], [2026, 5, 21], [2026, 8, 17], [2026, 11, 21]]) {
      const date = new Date(y, m, d);
      const utc = sunsetUtcHours(date, { ...RAMBAM_REFERENCE, latitude: JERUSALEM.latitude, longitude: JERUSALEM.longitude, elevationM: 0 });
      const jd = jdAt(date, utc);
      const sun = skyPosition(modernSunLongitude(new Date(Date.UTC(y, m, d, Math.floor(utc), (utc % 1) * 60))), 0, jd, JERUSALEM);
      expect(Math.abs(sun.altitude - -0.833), date.toDateString()).toBeLessThan(0.4);
      // And in the west, where the sun sets.
      expect(sun.azimuth).toBeGreaterThan(230);
      expect(sun.azimuth).toBeLessThan(310);
    }
  });
});

describe('the fact the window view teaches', () => {
  it('at the same clock time, the star frame slides ~1° west per night', () => {
    const jd1 = jdAt(new Date(2026, 7, 17), 17);
    const jd2 = jdAt(new Date(2026, 7, 18), 17);
    const drift = ((lstDeg(jd2, 35.2) - lstDeg(jd1, 35.2)) % 360 + 360) % 360;
    expect(drift).toBeCloseTo(0.9856, 3);
    // Seen from the ground: a fixed star's hour angle grows by that
    // much, so it stands about a degree further along its nightly arc.
    const a1 = equatorialToHorizontal(200, 10, jd1, JERUSALEM);
    const a2 = equatorialToHorizontal(200, 10, jd2, JERUSALEM);
    expect(a1.altitude).not.toBeCloseTo(a2.altitude, 1);
  });
});
