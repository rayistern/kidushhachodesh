// @vitest-environment jsdom
/**
 * The crescent card's pointing arrow.
 *
 * Three reader questions in a row showed the drawing was carrying two
 * kinds of direction with no way to tell them apart: the horizon's
 * compass ends and the horns' aim. The arrow out of the crescent's
 * mouth now names the aim, and it is built from the same away-from-sun
 * vector the bow is rotated by, so the two cannot disagree.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CrescentDirection, { mouthScreenRotation } from './CrescentDirection';
import { crescentDirection } from '../../../lib/khDeclination';
import { skyPosition, jdAt } from '../../../lib/skyView';
import { getFullCalculation } from '../../../engine/pipeline';
import { dateFromEpochDays } from '../../../engine/epochDays';
import { sunsetUtcHours, RAMBAM_REFERENCE } from '../../../lib/localObserver';

afterEach(cleanup);

describe('the pointing arrow', () => {
  it("labels the arrow with his evening's answer on load", () => {
    render(<CrescentDirection />);
    // 14° north → horns south-east (KH 19:13).
    expect(crescentDirection(14).horns).toBe('south-east');
    expect(screen.getByText('horns → south-east')).toBeTruthy();
  });

  it('follows the slider through all three cases', () => {
    render(<CrescentDirection />);
    const slider = screen.getByLabelText("The moon's distance from the equator, in degrees");
    fireEvent.change(slider, { target: { value: '-14' } });
    expect(screen.getByText('horns → north-east')).toBeTruthy();
    fireEvent.change(slider, { target: { value: '0' } });
    expect(screen.getByText('horns → due east')).toBeTruthy();
  });

  it('says which labels are which, since they were being confused', () => {
    render(<CrescentDirection />);
    expect(
      screen.getByText(/corner labels name the horizon's compass ends; the gold arrow names the horns/),
    ).toBeTruthy();
    expect(screen.getByText(/the mouth is the pointing/)).toBeTruthy();
  });
});

describe('the drawing shows the reversal instead of contradicting it', () => {
  it('maps each answer to the right screen direction, facing west', () => {
    // Up = east, left = south, right = north. A first version aimed the
    // crescent radially away from a sun-glow at due west, which pointed
    // the northerly case up-NORTH on screen under a label saying
    // SOUTH-east — the reader caught the contradiction.
    expect(mouthScreenRotation('south-east')).toBe(-45); // up-left
    expect(mouthScreenRotation('north-east')).toBe(45); // up-right
    expect(mouthScreenRotation('due east')).toBe(0); // straight up
  });

  it("real geometry backs the halacha on his evening: north moon, south side", () => {
    // The fact the corrected prose leans on, computed rather than told:
    // at sunset+20 on his worked evening the moon (14° north of the
    // equator) stands at a smaller azimuth-from-north-offset than the
    // sun's set-point — i.e. on its SOUTH side, facing west.
    const obs = { latitude: 31.78, longitude: 35.2137 };
    const date = dateFromEpochDays(29);
    const calc = getFullCalculation(date);
    const utc = sunsetUtcHours(date, { ...RAMBAM_REFERENCE }) + 20 / 60;
    const jd = jdAt(date, utc);
    const sun = skyPosition(calc.sun.trueLongitude, 0, jd, obs);
    const moon = skyPosition(calc.moon.trueLongitude, calc.moon.latitude, jd, obs);
    expect(moon.azimuth).toBeLessThan(sun.azimuth); // south of it, facing west
    expect(moon.altitude).toBeGreaterThan(sun.altitude); // and above: mouth up-south = SE
  });

  it('states the not-exact caveat in his own terms', () => {
    render(<CrescentDirection />);
    expect(screen.getByText(/will not be exact/)).toBeTruthy();
  });
});
