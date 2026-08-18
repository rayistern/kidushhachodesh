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
import { render, screen, cleanup } from '@testing-library/react';
import SkyPage from './SkyPage';
import { getFullCalculation } from '../../engine/pipeline';
import { dateFromEpochDays } from '../../engine/epochDays';
import { skyPosition, jdAt } from '../../lib/skyView';
import { sunsetUtcHours, RAMBAM_REFERENCE } from '../../lib/localObserver';

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
    const date = dateFromEpochDays(29);
    const calc = getFullCalculation(date);
    const utc = sunsetUtcHours(date, { ...RAMBAM_REFERENCE }) + 20 / 60;
    const jd = jdAt(date, utc);
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
