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
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
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

  it('states the constant-total fact in prose, with its provenance', () => {
    // The figure that carried this fact was removed — it leaned on
    // "first table / second table" language and cryptic numbers. The
    // fact survives as one sentence beside the curves, still owned as
    // this book's observation, not his.
    render(<ParallaxBySign />);
    expect(screen.getByText(/between 56′ and 61′/)).toBeTruthy();
    expect(screen.getByText(/KH 17:24/)).toBeTruthy();
  });
});

describe('the early-exit card computes real nights', () => {
  // Deferred import keeps the top of the file about the parallax figure.
  it("opens on his worked evening, engine-computed, and knows it isn't settled", async () => {
    const { default: QuickVerdict } = await import('./QuickVerdict');
    render(<QuickVerdict />);
    // The evening of 2 Iyar 4938 — 1178-04-27 civil.
    expect(screen.getByText('1178-04-27')).toBeTruthy();
    expect(screen.getByText(/computed by the engine/)).toBeTruthy();
    // His evening sits in the undecided band (9° < 11°27' ≤ 15°), which
    // is exactly why KH 17 continues past the early exit.
    expect(screen.getByText(/Not settled — the long chain is needed/)).toBeTruthy();
  });

  it('drops the engine claim the moment a slider is moved by hand', async () => {
    const { default: QuickVerdict } = await import('./QuickVerdict');
    render(<QuickVerdict />);
    const slider = screen.getByLabelText('First longitude in degrees');
    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText(/Set by hand/)).toBeTruthy();
    expect(screen.queryByText(/computed by the engine/)).toBeNull();
  });
});
