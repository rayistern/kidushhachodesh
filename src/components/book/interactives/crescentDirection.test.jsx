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
import CrescentDirection from './CrescentDirection';
import { crescentDirection } from '../../../lib/khDeclination';

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
