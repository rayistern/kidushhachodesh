/**
 * Where the epicycle figure puts the moon.
 *
 * A reader asked whether the moon is supposed to rotate when the slider
 * moves. It is — one slider drives both motions — but checking that
 * turned up a real error in the placement.
 *
 * The figure drew the moon at an absolute angle equal to the maslul. The
 * maslul is not an absolute angle: it is measured from the APOGEE of the
 * small circle, the point furthest from the earth, and that point turns
 * with the arm. So the moon's direction from the small circle's centre is
 * the arm's direction LESS the maslul.
 *
 * Two independent facts from the engine settle it, and both are asserted
 * below rather than argued:
 *
 *   1. KH 15:4-6's table gives a correction of exactly zero at maslul 0°
 *      and at 180°. A correction vanishes only where the moon lies on the
 *      earth-to-centre line, so those two maslul values must be the ends
 *      of that line — which is true of an angle measured from the apogee
 *      and false of one measured from a fixed direction.
 *   2. KH 15:6 subtracts the correction when the maslul is under 180°, so
 *      the moon must appear BEHIND the arm through that whole half.
 *
 * The old placement satisfied neither: it left the moon off the line at
 * both 0° and 180°, and put it ahead of the arm for much of the first
 * half.
 */
import { describe, it, expect } from 'vitest';
import { CONSTANTS } from '../../../engine/constants';

const DEG = Math.PI / 180;
const R = 88;
const r = 30;

/** The figure's placement, in plain maths coordinates. */
function offsetFromArm(meanDeg, maslulDeg, { legacy = false } = {}) {
  const ex = R * Math.cos(meanDeg * DEG);
  const ey = R * Math.sin(meanDeg * DEG);
  const theta = (legacy ? maslulDeg : meanDeg - maslulDeg) * DEG;
  const mx = ex + r * Math.cos(theta);
  const my = ey + r * Math.sin(theta);
  // Signed angle between the arm and the earth→moon line.
  return ((Math.atan2(my, mx) / DEG - meanDeg + 540) % 360) - 180;
}

describe("the moon sits where the Rambam's own table says it must", () => {
  it('lies exactly on the arm at maslul 0° and 180°', () => {
    // These are the two rows of KH 15:4-6 that read zero.
    const table = CONSTANTS.MOON_MASLUL_CORRECTIONS;
    expect(table.find((row) => row.maslul === 0).correction).toBe(0);
    expect(table.find((row) => row.maslul === 180).correction).toBe(0);

    for (const mean of [0, 50, 137, 300]) {
      expect(Math.abs(offsetFromArm(mean, 0)), `mean ${mean}`).toBeLessThan(1e-9);
      expect(Math.abs(offsetFromArm(mean, 180)), `mean ${mean}`).toBeLessThan(1e-9);
    }
  });

  it('runs behind the arm below 180° and ahead of it above — KH 15:6', () => {
    for (const mean of [0, 50, 137, 300]) {
      for (const maslul of [10, 45, 90, 135, 170]) {
        expect(offsetFromArm(mean, maslul), `mean ${mean}, maslul ${maslul}`).toBeLessThan(0);
      }
      for (const maslul of [190, 225, 270, 315, 350]) {
        expect(offsetFromArm(mean, maslul), `mean ${mean}, maslul ${maslul}`).toBeGreaterThan(0);
      }
    }
  });

  it('swings furthest out near the middle of each half, as the table does', () => {
    // His correction peaks at maslul 100°, not at 90° — a real feature of
    // the table. The drawn offset peaks in that neighbourhood too.
    const peakRow = CONSTANTS.MOON_MASLUL_CORRECTIONS.reduce((a, b) =>
      b.correction > a.correction ? b : a,
    );
    expect(peakRow.maslul).toBe(100);

    let worst = 0;
    let worstAt = null;
    for (let m = 1; m < 180; m++) {
      const size = Math.abs(offsetFromArm(50, m));
      if (size > worst) {
        worst = size;
        worstAt = m;
      }
    }
    expect(worstAt).toBeGreaterThan(80);
    expect(worstAt).toBeLessThan(130);
  });

  it('is a strict improvement on what it replaced', () => {
    // The old placement, kept here only so the regression is documented
    // and cannot be reintroduced as "equivalent".
    const legacyAtZero = Math.abs(offsetFromArm(50, 0, { legacy: true }));
    const legacyAt180 = Math.abs(offsetFromArm(50, 180, { legacy: true }));
    expect(legacyAtZero).toBeGreaterThan(1); // should have been 0
    expect(legacyAt180).toBeGreaterThan(1); // should have been 0
    // And it had the wrong sign where the Rambam subtracts.
    expect(offsetFromArm(50, 90, { legacy: true })).toBeGreaterThan(0);
    expect(offsetFromArm(50, 90)).toBeLessThan(0);
  });
});

describe('the exaggeration is acknowledged, not hidden', () => {
  it('draws the small circle far larger than life', () => {
    // The Rambam's epicycle gives a maximum equation of about 5°; the
    // figure's r/R would give roughly 20°. The card says so in its
    // header and caption — this pins the fact that it IS an
    // exaggeration, so nobody later reads the angles off the picture.
    const drawnMaxEquation = Math.asin(r / R) / DEG;
    const realMaxEquation = Math.max(
      ...CONSTANTS.MOON_MASLUL_CORRECTIONS.map((row) => row.correction),
    );
    expect(drawnMaxEquation).toBeGreaterThan(realMaxEquation * 2);
    expect(realMaxEquation).toBeGreaterThan(5);
    expect(realMaxEquation).toBeLessThan(5.2);
  });
});
