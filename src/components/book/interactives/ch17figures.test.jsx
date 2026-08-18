// @vitest-environment jsdom
/**
 * The chapter-17 geometry figures added at a reader's request: a sphere
 * behind the slice, a horizon dome behind the stretch, and a triangle
 * behind the two parallax tables. Each figure makes a checkable claim;
 * these tests check them, not the pixels.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import SliceShape, { roadLevelAngle } from './SliceShape';
import StretchShape, { settingDiveAngle } from './StretchShape';
import ParallaxBySign, { wholeShiftArcmin } from './ParallaxBySign';
import { MAX_TILT } from '../../../lib/khDeclination';
import { CONSTANTS } from '../../../engine/constants';

afterEach(cleanup);

describe("the slice sphere's claim: road-against-level angle", () => {
  it('is the full 23½° at the crossings and nothing at the turning points', () => {
    expect(roadLevelAngle(0)).toBeCloseTo(MAX_TILT, 1);
    expect(roadLevelAngle(180)).toBeCloseTo(MAX_TILT, 1);
    expect(roadLevelAngle(90)).toBeCloseTo(0, 1);
    expect(roadLevelAngle(270)).toBeCloseTo(0, 1);
  });

  it('tracks the staircase: bigger fraction, bigger angle', () => {
    // The peak band (2/5) sits at a larger angle than the 1/6 band.
    expect(roadLevelAngle(10)).toBeGreaterThan(roadLevelAngle(75));
  });

  it('renders with both arrows labelled on the drawing, inside an aside', () => {
    render(<SliceShape />);
    expect(screen.getByText(/° apart/)).toBeTruthy();
    expect(screen.getAllByText('where the road goes next').length).toBeGreaterThan(0);
    expect(screen.getByText(/level — along its ring/)).toBeTruthy();
    // Collapsed by default: regular readers get the staircase alone.
    expect(screen.getByText(/For the curious: why those anchors/)).toBeTruthy();
  });
});

describe("the stretch dome's claim: the belt's dive at setting", () => {
  it('shallow for the deep-shrink signs, steep for the stretch signs', () => {
    // Steep = degrees file across one at a time = slow = stretch; his
    // stretches sit around the 12th and 1st signs (Aries sets slowly at
    // northern latitudes — the classical long descension). Shallow =
    // a run of belt drops across together = fast = shrink; his deepest
    // shrink (−1/3) covers the 6th and 7th. Mid-sign sample points.
    const shrink6 = settingDiveAngle(165);
    const shrink7 = settingDiveAngle(195);
    const stretch12 = settingDiveAngle(345);
    const stretch1 = settingDiveAngle(15);
    expect(shrink6).toBeLessThan(45);
    expect(shrink7).toBeLessThan(45);
    expect(stretch12).toBeGreaterThan(60);
    expect(stretch1).toBeGreaterThan(60);
  });

  it('stays within the geometric bounds for 32° north', () => {
    // The belt-horizon angle at setting swings around 90° − φ by
    // roughly the obliquity: ~30° to ~85° at φ = 32.
    for (let d = 0; d < 360; d += 15) {
      const a = settingDiveAngle(d);
      expect(a, `at ${d}°`).toBeGreaterThan(25);
      expect(a, `at ${d}°`).toBeLessThan(88);
    }
  });

  it('renders the dome with its angle readout and its no-equator stance', () => {
    render(<StretchShape />);
    expect(screen.getByText(/meets the horizon at \d+°/)).toBeTruthy();
    expect(screen.getByText(/there is no\s+equator in this picture/)).toBeTruthy();
  });
});

describe("the parallax triangle's claim: one shift, split by sign", () => {
  it('the whole shift is nearly constant across all twelve signs', () => {
    // √(lon² + lat²) lands within 56′–61′ everywhere — the moon's own
    // horizontal parallax (~57′) showing through his two tables.
    for (let i = 0; i < 12; i++) {
      const whole = wholeShiftArcmin(i);
      expect(whole, CONSTANTS.PARALLAX_LON_BY_MAZAL[i].hebrew).toBeGreaterThan(56);
      expect(whole, CONSTANTS.PARALLAX_LON_BY_MAZAL[i].hebrew).toBeLessThan(61);
    }
  });

  it('renders the triangle with both components named', () => {
    render(<ParallaxBySign />);
    expect(screen.getByText(/along the belt: .*off the gap/)).toBeTruthy();
    expect(screen.getByText(/across it: \d+′ onto the height/)).toBeTruthy();
    expect(screen.getByText(/where it is seen — \d+′ away/)).toBeTruthy();
  });
});
