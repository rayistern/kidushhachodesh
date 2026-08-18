// @vitest-environment jsdom
/**
 * The declination card's sphere figure.
 *
 * A reader asked for the dashboard's globe, cut down to the two lines
 * chapter 19 needs — the equator and the sun's road as great circles,
 * with the tabulated inclination visible as a meridian arc. These pin
 * that the sphere and the wave both render, share the slider, and that
 * the sphere carries the chapter's own landmarks: the two crossings,
 * the pole every meridian runs through, and the arc's value in words.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Declination from './Declination';
import { declinationAt } from '../../../lib/khDeclination';

afterEach(cleanup);

describe('the sphere above the wave', () => {
  it('draws both figures: each names the equator and the road', () => {
    render(<Declination />);
    expect(screen.getAllByText('the equator').length).toBe(2);
    expect(screen.getAllByText("the sun's road").length).toBe(2);
  });

  it("carries the chapter's landmarks: the crossings and the pole", () => {
    render(<Declination />);
    expect(screen.getByText('Taleh 0°')).toBeTruthy();
    expect(screen.getByText('Moznayim 180°')).toBeTruthy();
    expect(screen.getByText('the pole of the equator')).toBeTruthy();
  });

  it("opens on his evening with the arc labelled north, matching the table", () => {
    render(<Declination />);
    const tilt = declinationAt(49);
    expect(tilt).toBeGreaterThan(0);
    expect(screen.getByText(`${tilt.toFixed(1)}° north`)).toBeTruthy();
  });

  it('follows the slider to the equator and to the south', () => {
    render(<Declination />);
    const slider = screen.getByLabelText("Position along the sun's road, in degrees");
    fireEvent.change(slider, { target: { value: '180' } });
    // On the crossing the point label and the readout both say so.
    expect(screen.getAllByText(/on the equator/).length).toBeGreaterThan(0);
    fireEvent.change(slider, { target: { value: '270' } });
    expect(screen.getByText(`${Math.abs(declinationAt(270)).toFixed(1)}° south`)).toBeTruthy();
  });
});
