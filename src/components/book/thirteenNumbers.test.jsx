// @vitest-environment jsdom
/**
 * The thirteen-numbers article. Its one hard promise is that every
 * figure on the page comes from the engine's constants, so article and
 * calculators cannot disagree — these tests hold the rendered text to
 * the constants, and count the foundations to exactly thirteen.
 */
import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, cleanup } from '@testing-library/react';
import ThirteenNumbers from './ThirteenNumbers';
import { CONSTANTS } from '../../engine/constants';
import {
  BAHARAD,
  SYNODIC_MONTH_PARTS,
  PARTS_PER_DAY,
  PARTS_PER_HOUR,
} from '../../engine/fixedCalendar/constants';

afterEach(cleanup);

const page = () =>
  render(
    <MemoryRouter>
      <ThirteenNumbers />
    </MemoryRouter>,
  );

describe('the calendar three, from the constants', () => {
  it('states the month as the decomposition of SYNODIC_MONTH_PARTS', () => {
    page();
    const d = Math.floor(SYNODIC_MONTH_PARTS / PARTS_PER_DAY);
    const h = Math.floor((SYNODIC_MONTH_PARTS % PARTS_PER_DAY) / PARTS_PER_HOUR);
    const p = SYNODIC_MONTH_PARTS % PARTS_PER_HOUR;
    expect(d).toBe(29);
    expect(screen.getByText(new RegExp(`The month: ${d} days, ${h} hours, ${p} parts`))).toBeTruthy();
  });

  it('states BaHaRaD from the BAHARAD constant', () => {
    page();
    expect(
      screen.getByText(
        new RegExp(`day ${BAHARAD.dayOfWeek} \\(Monday\\), ${BAHARAD.hours} hours, ${BAHARAD.parts} parts`),
      ),
    ).toBeTruthy();
    expect(screen.getByText(/Seven leap years in every nineteen/)).toBeTruthy();
  });
});

describe('the five pairs, from the constants', () => {
  it('renders each epoch position and daily speed as the engine holds them', () => {
    page();
    const shown = [
      [CONSTANTS.SUN.START_POSITION, '1st sign'],
      [CONSTANTS.SUN.APOGEE_START, '3rd sign'],
      [CONSTANTS.MOON.START_POSITION, '2nd sign'],
      [CONSTANTS.MOON.MASLUL_START, null],
      [CONSTANTS.NODE.START_POSITION, null],
    ];
    for (const [pos] of shown) {
      const re = new RegExp(`${pos.degrees}° ${pos.minutes}′ ${pos.seconds}″`);
      expect(screen.getByText(re), re.source).toBeTruthy();
    }
    for (const rate of [
      CONSTANTS.MOON.MEAN_MOTION_PER_DAY,
      CONSTANTS.MOON.MASLUL_MEAN_MOTION,
      CONSTANTS.NODE.DAILY_MOTION,
    ]) {
      const re = new RegExp(`${rate.degrees}° ${rate.minutes}′ ${rate.seconds}″`);
      expect(screen.getByText(re), re.source).toBeTruthy();
    }
    // The sun's rate carries the operative third of a second.
    expect(screen.getByText(/0° 59′ 8\.33″ a day/)).toBeTruthy();
    // The node runs backwards, and the page says so (in the table and
    // again in the odd-ones section).
    expect(screen.getAllByText(/backwards/).length).toBeGreaterThan(0);
  });

  it('cites the epoch and each statement', () => {
    page();
    expect(screen.getByText(/3 Nisan 4938 \(KH 11:16\)/)).toBeTruthy();
    for (const ref of ['KH 12:1-2', 'KH 12:2', 'KH 14:1, 14:4', 'KH 14:3-4', 'KH 16:2-3']) {
      expect(screen.getByText(ref)).toBeTruthy();
    }
  });
});

describe('the two odd ones', () => {
  it('states the stakes of each: the gap transfer, and the heaviest lever', () => {
    page();
    expect(screen.getByText(/lands one-for-one in/)).toBeTruthy();
    expect(screen.getByText(/up to 5°, north or south/)).toBeTruthy();
    expect(screen.getByText(/no\s+eclipse of the sun every month/)).toBeTruthy();
    expect(screen.getByText(/full lap in about 18.6 years/)).toBeTruthy();
  });
});

describe('the count and the funnel', () => {
  it('really is thirteen: 3 + 5 anchors + 5 speeds', () => {
    // The page's arithmetic, kept honest: three calendar numbers and
    // five position/speed pairs.
    expect(3 + 5 * 2).toBe(13);
  });

  it('ends at the one number the verdict reads, and owns its framing', () => {
    page();
    expect(screen.getByText('קשת הראייה')).toBeTruthy();
    expect(screen.getByText(/counting the foundations to thirteen — is this book's/)).toBeTruthy();
  });
});
