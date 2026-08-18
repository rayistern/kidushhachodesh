// @vitest-environment jsdom
/**
 * The parallax triangle on the two-tables card. Two sphere figures
 * (slice, stretch) were added alongside it and then REMOVED at the
 * same reader's request — diagrams that puzzled more than they taught.
 * The triangle stayed because it is flat and is itself the explanation:
 * one shift of nearly constant size, split by the belt's slant. Its
 * checkable claim is pinned here, and so is its provenance line — the
 * Rambam gives the tables and no reasons (KH 17:24 says the whys live
 * in the Greek geometry books), so the card must say the mechanism is
 * our reconstruction, not his statement.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ParallaxBySign, { wholeShiftArcmin } from './ParallaxBySign';
import { CONSTANTS } from '../../../engine/constants';

afterEach(cleanup);

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

  it('says whose the mechanism is: his tables, our triangle', () => {
    render(<ParallaxBySign />);
    expect(screen.getByText(/He gives only the two tables/)).toBeTruthy();
    expect(screen.getByText(/KH 17:24/)).toBeTruthy();
  });
});
