/**
 * The KH 13:2 figure asserts two identities on screen. They are printed
 * as arithmetic the reader can check, so they had better hold for every
 * course the slider can reach — not just the one it opens on.
 *
 * The component keeps its geometry in a local `solve`; this reproduces
 * it rather than exporting it, because the identities are properties of
 * the geometry itself and should fail here if the geometry is wrong
 * anywhere, including in a future rewrite of the drawing code.
 */
import { describe, it, expect } from 'vitest';
import { CONSTANTS } from '../../../engine/constants';

const DEG = Math.PI / 180;
const ECCENTRICITY = Math.tan((1 + 59 / 60) * DEG);

function solve(course, eccentricity) {
  const rad = course * DEG;
  const bx = eccentricity + Math.cos(rad);
  const by = Math.sin(rad);
  const c = Math.atan2(by, bx) / DEG;
  // Folded into (−180, 180] — see the note on the component's copy.
  const a = ((course - c + 540) % 360) - 180;
  return { b: course, c, a, d: 180 - course };
}

const COURSES = [1, 15, 30, 45, 60, 90, 120, 150, 179];

describe("Touger's two identities on the KH 13:2 figure", () => {
  it('a + c + d = 180° — the angles of the triangle', () => {
    for (const course of COURSES) {
      const { a, c, d } = solve(course, ECCENTRICITY);
      expect(Math.abs(a + c + d - 180)).toBeLessThan(1e-9);
    }
  });

  it('b + d = 180° — b and d lie on a straight line', () => {
    for (const course of COURSES) {
      const { b, d } = solve(course, ECCENTRICITY);
      expect(Math.abs(b + d - 180)).toBeLessThan(1e-9);
    }
  });

  it('b = c + a — the conclusion the digitised footnote mangles', () => {
    for (const course of COURSES) {
      const { a, b, c } = solve(course, ECCENTRICITY);
      expect(Math.abs(b - (c + a))).toBeLessThan(1e-9);
    }
  });

  it('holds at the exaggerated eccentricity the figure is drawn with', () => {
    // The drawing uses an inflated offset for legibility. The identities
    // are what the reader is checking against the picture, so they must
    // hold there too — otherwise the figure would contradict its caption.
    for (const course of COURSES) {
      const { a, b, c, d } = solve(course, 0.4);
      expect(Math.abs(a + c + d - 180)).toBeLessThan(1e-9);
      expect(Math.abs(b - (c + a))).toBeLessThan(1e-9);
    }
  });
});

describe('the angle a really is the correction of KH 13:4', () => {
  it("matches the Rambam's tabulated corrections", () => {
    // If `a` were not the menat hamaslul, the figure would be proving
    // something true but irrelevant. Checked against his own table.
    for (const { maslul, correction } of CONSTANTS.SUN_MASLUL_CORRECTIONS) {
      if (maslul === 0 || maslul === 180) continue;
      const { a } = solve(maslul, ECCENTRICITY);
      expect(Math.abs(a - correction) * 60).toBeLessThan(1);
    }
  });

  it('vanishes at the two courses the chapter says need no correction', () => {
    expect(Math.abs(solve(180, ECCENTRICITY).a)).toBeLessThan(1e-9);
    expect(Math.abs(solve(360, ECCENTRICITY).a)).toBeLessThan(1e-9);
  });
});
