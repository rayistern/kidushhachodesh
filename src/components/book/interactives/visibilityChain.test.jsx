// @vitest-environment jsdom
/**
 * The chain card's recipe lines.
 *
 * A reader asked for the ch15 nine-step treatment here too — each row
 * naming the earlier steps it is built from. The dynamic ones (steps 6
 * and 10 state the direction actually in force) are claims about the
 * engine's arithmetic, so both directions are checked numerically as
 * well as rendered.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';

afterEach(cleanup);
import VisibilityChain from './VisibilityChain';
import { getFullCalculation } from '../../../engine/pipeline';
import { dateFromEpochDays } from '../../../engine/epochDays';

describe('the recipes render', () => {
  it('shows the static ones', async () => {
    render(<VisibilityChain />);
    expect(await screen.findByText('= step 2 − step 1')).toBeTruthy();
    expect(screen.getByText(/= step 4 − the by-sign minutes/)).toBeTruthy();
    expect(screen.getByText(/two thirds of step 3/)).toBeTruthy();
  });

  it("shows the direction actually in force on his example (south)", async () => {
    render(<VisibilityChain />);
    expect(await screen.findByText(/south, so pushed further south/)).toBeTruthy();
    expect(screen.getByText(/= step 8 − step 9 \(step 3 was south\)/)).toBeTruthy();
  });
});

describe('the recipes are true of the engine', () => {
  const norm = (d) => ((d % 360) + 360) % 360;

  it.each([[29], [383], [755]])('at %i days', (days) => {
    const calc = getFullCalculation(dateFromEpochDays(days));
    const s = Object.fromEntries(calc.steps.map((x) => [x.id, x]));

    // step 4 = step 2 − step 1
    expect(norm(s.elongation.result)).toBeCloseTo(
      norm(s.moonTrueLongitude.result - s.sunTrueLongitude.result),
      6,
    );
    // step 9 = two thirds of |step 3|
    expect(s.mnatGovahHaMedinah.result).toBeCloseTo(
      (2 / 3) * Math.abs(s.moonLatitude.result),
      6,
    );
    // step 10 = step 8 ± step 9 by step 3's side
    const expected =
      s.moonLatitude.result >= 0
        ? s.orechRevii.result + s.mnatGovahHaMedinah.result
        : s.orechRevii.result - s.mnatGovahHaMedinah.result;
    expect(s.keshetHaReiyah.result).toBeCloseTo(expected, 6);
  });
});

describe('the running-number family is marked', () => {
  it('rings exactly steps 4, 5, 7, 8 and 10', async () => {
    // The gap in its successive states — first through fourth longitude,
    // then the arc, which is the same number wearing its final name.
    const { container } = render(<VisibilityChain />);
    await screen.findByText('= step 2 − step 1');
    const ringed = [...container.querySelectorAll('li')]
      .filter((li) => li.querySelector('[class*="ring-2"]'))
      .map((li) => Number(li.querySelector('span').textContent));
    expect(ringed).toEqual([4, 5, 7, 8, 10]);
  });
});

describe('steps 7 and 8 state their live operation', () => {
  it("names the actual slice and fraction on his example", async () => {
    render(<VisibilityChain />);
    // His evening: slice adds 1°0'50" (11°28' − 10°27'10"); the moon in
    // the 2nd sign stretches by a fifth.
    expect(await screen.findByText(/= step 5 \+ 1° 0′ .*the slice of step 6/)).toBeTruthy();
    expect(screen.getByText(/= step 7 \+ a fifth of itself/)).toBeTruthy();
  });
});
