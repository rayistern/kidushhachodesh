// @vitest-environment jsdom
/**
 * The /sky page — the book's positions drawn on the real evening sky.
 *
 * The geometry itself is pinned in lib/skyView.test.js; these tests pin
 * what the page does with it: that his worked evening renders the sun
 * just below the horizon and the moon just above it in the west (the
 * same configuration KH 17 judges "visible"), that the regime note is
 * on the page, and that the hold-the-clock affordance exists with the
 * sidereal fact stated.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SkyPage, { eveningOf, moonPhasePath } from './SkyPage';
import { getFullCalculation } from '../../engine/pipeline';
import { dateFromEpochDays } from '../../engine/epochDays';
import { skyPosition, jdAt } from '../../lib/skyView';
import { sunsetUtcHours, RAMBAM_REFERENCE } from '../../lib/localObserver';
import { modernMoonPosition, modernSunLongitude, angularDifference } from '../../lib/modernAstronomy';

afterEach(cleanup);

const page = () =>
  render(
    <MemoryRouter>
      <SkyPage />
    </MemoryRouter>,
  );

describe('the page', () => {
  it('renders both bodies, labelled as his', async () => {
    page();
    expect(await screen.findByText('his sun')).toBeTruthy();
    expect(screen.getByText('his moon')).toBeTruthy();
  });

  it('carries the regime note — positions his, frame modern', () => {
    page();
    expect(screen.getByText(/sky they are drawn onto .* is modern geometry/)).toBeTruthy();
    expect(screen.getByText(/trail the real one by about half a degree/)).toBeTruthy();
  });

  it('offers hold-the-clock with the sidereal fact stated', () => {
    page();
    expect(screen.getByText(/23h 56m 4s/)).toBeTruthy();
    expect(screen.getByText(/1°\s*west per night/)).toBeTruthy();
  });
});

describe("his worked evening's scene, numerically", () => {
  it('puts the sun just below the west horizon and the moon just above it', () => {
    // The same numbers the figure plots, computed the same way.
    const obs = { latitude: 31.78, longitude: 35.2137 };
    // The evening BEGINNING Hebrew day 29 — one civil day before the
    // daytime date. Pinned this way after the one-day pairing bug.
    const { daytime, eve } = eveningOf(29);
    const calc = getFullCalculation(daytime);
    const utc = sunsetUtcHours(eve, { ...RAMBAM_REFERENCE }) + 20 / 60;
    const jd = jdAt(eve, utc);
    const sun = skyPosition(calc.sun.trueLongitude, 0, jd, obs);
    const moon = skyPosition(calc.moon.trueLongitude, calc.moon.latitude, jd, obs);

    expect(sun.altitude).toBeLessThan(-3);
    expect(sun.altitude).toBeGreaterThan(-9);
    expect(moon.altitude).toBeGreaterThan(2);
    expect(moon.altitude).toBeLessThan(12);
    // Both in the western window the page draws (195°-345°).
    for (const b of [sun, moon]) {
      expect(b.azimuth).toBeGreaterThan(195);
      expect(b.azimuth).toBeLessThan(345);
    }
    // And the verdict for that night is his: visible.
    expect(calc.moon.visibilityVerdict).toBe('visible');
  });
});

describe('the real-sky toggle', () => {
  it('swaps the drawn bodies to modern positions, relabelled', async () => {
    page();
    expect(await screen.findByText('his sun')).toBeTruthy();
    const toggle = screen.getByText(/Show the real sky/).closest('label').querySelector('input');
    fireEvent.click(toggle);
    expect(await screen.findByText('the real sun')).toBeTruthy();
    expect(screen.getByText('the real moon')).toBeTruthy();
    // The deltas are on the readouts, so the gap between his sky and the
    // real one is a number, not an impression.
    expect(screen.getAllByText(/his sits [+−-]?\d+\.\d+° from this/).length).toBe(2);
  });

  it("keeps the verdict his — the real moon never enters it", () => {
    page();
    expect(screen.getByText(/verdict readout stays his either way/)).toBeTruthy();
  });

  it('labels the belt with names as well as numbers', async () => {
    page();
    await screen.findByText('his sun');
    // At least one transliterated name on the gold line, beneath its number.
    const names = ['Taleh', 'Shor', 'Teomim', 'Sartan', 'Aryeh', 'Betulah', 'Moznayim', 'Akrav', 'Keshet', "G'di", "D'li", 'Dagim'];
    const found = names.filter((n) => screen.queryAllByText(n).length > 0);
    expect(found.length).toBeGreaterThan(0);
  });
});

describe('the curve of the belt is explained', () => {
  it('says why the gold line arches', () => {
    page();
    expect(screen.getByText(/full\s+circle round the whole sky, seen from inside/)).toBeTruthy();
  });

  it('really does arch: altitude rises then falls along the visible run', () => {
    // The physical claim behind the caption, checked in the same frame
    // the page draws: sampling the belt across the window on his evening,
    // the altitude is not monotonic — it climbs toward the southern high
    // point and descends to the western horizon.
    const obs = { latitude: 31.78, longitude: 35.2137 };
    const date = dateFromEpochDays(29);
    const utc = sunsetUtcHours(date, { ...RAMBAM_REFERENCE }) + 20 / 60;
    const jd = jdAt(date, utc);
    const alts = [];
    for (let lambda = 0; lambda < 360; lambda += 2) {
      const p = skyPosition(lambda, 0, jd, obs);
      if (p.azimuth > 195 && p.azimuth < 345 && p.altitude > -5) alts.push(p.altitude);
    }
    expect(Math.max(...alts)).toBeGreaterThan(20); // well up the sky
    expect(Math.min(...alts)).toBeLessThan(2); // down to the horizon
  });
});

describe('the evening pairing (the one-day bug)', () => {
  it("draws the evening before the day-count's civil daytime", () => {
    const { daytime, eve } = eveningOf(29);
    expect((daytime - eve) / 86400000).toBe(1);
    // His example: night beginning Friday 2 Iyar = Thursday's evening.
    expect(daytime.toISOString().slice(0, 10)).toBe('1178-04-28');
    expect(eve.toISOString().slice(0, 10)).toBe('1178-04-27');
  });

  it('puts his moon within 1.5° of the real moon on his worked evening', () => {
    // THE regression test. At the wrong evening the gap was 13° — a full
    // day of moon travel — and the real-sky toggle exposed it.
    const { daytime, eve } = eveningOf(29);
    const calc = getFullCalculation(daytime);
    const utc = sunsetUtcHours(eve, { ...RAMBAM_REFERENCE }) + 20 / 60;
    const instant = new Date(Date.UTC(eve.getFullYear(), eve.getMonth(), eve.getDate(), 0, 0, 0) + utc * 3600000);
    const moonGap = Math.abs(angularDifference(calc.moon.trueLongitude, modernMoonPosition(instant).longitude));
    const sunGap = Math.abs(angularDifference(calc.sun.trueLongitude, modernSunLongitude(instant)));
    expect(moonGap).toBeLessThan(1.5);
    expect(sunGap).toBeLessThan(1.0);
  });
});

describe("the moon's drawn phase", () => {
  it('is a sliver at conjunction, a half at quadrature, full at opposition', () => {
    expect(moonPhasePath(0, 7).litFraction).toBeCloseTo(0, 6);
    expect(moonPhasePath(90, 7).litFraction).toBeCloseTo(0.5, 6);
    expect(moonPhasePath(180, 7).litFraction).toBeCloseTo(1, 6);
    expect(moonPhasePath(270, 7).litFraction).toBeCloseTo(0.5, 6);
  });

  it('bows the terminator the right way: toward the sun below 90°, away above', () => {
    // The sweep flag in the path is the bow direction; a crescent's
    // terminator returns via the sun side (sweep 0), a gibbous via the
    // far side (sweep 1).
    expect(moonPhasePath(20, 7).d).toMatch(/0 0 0 0 -7 Z$/);
    expect(moonPhasePath(160, 7).d).toMatch(/0 0 1 0 -7 Z$/);
  });

  it("on his worked evening it is a thin crescent — the sliver a witness would report", () => {
    const { daytime } = eveningOf(29);
    const calc = getFullCalculation(daytime);
    const elong = ((calc.moon.trueLongitude - calc.sun.trueLongitude) % 360 + 360) % 360;
    const { litFraction } = moonPhasePath(elong, 7);
    expect(litFraction).toBeGreaterThan(0.005);
    expect(litFraction).toBeLessThan(0.03); // ~1% lit: a genuine first crescent
  });

  it('but the DRAWN sliver never vanishes into the outline', () => {
    // A reader on day 29 saw only an empty circle: a true 1%-lit sliver
    // is sub-pixel at r=7. The terminator's semi-axis is floored so at
    // least a quarter-radius of sliver always shows, while litFraction
    // keeps reporting the truth.
    for (const elong of [1, 5, 11.4, 175, 359]) {
      const d = moonPhasePath(elong, 7).d;
      const a = Number(d.match(/A ([\d.]+) 7 0 0 [01] 0 -7 Z/)[1]);
      expect(a, `elong ${elong}`).toBeLessThanOrEqual(7 - 7 * 0.24 + 1e-9);
    }
    // And an honest half-moon is untouched by the floor.
    expect(
      Number(moonPhasePath(90, 7).d.match(/A ([\d.]+) 7 0 0 [01] 0 -7 Z/)[1]),
    ).toBeCloseTo(0, 3);
  });

  it('renders as a path inside a rotated group, not a plain disc', async () => {
    const { container } = page();
    await screen.findByText('his moon');
    const rotated = [...container.querySelectorAll('g[transform*="rotate"] path')];
    expect(rotated.length).toBeGreaterThan(0);
  });
});
