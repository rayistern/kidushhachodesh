/**
 * KH 7-8 — from a molad to a Rosh HaShanah, and from two Rosh
 * HaShanahs to the shape of the year.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** — [R] KH 7:1-5, 8:5-8
 *  SURFACE CATEGORY: internal lib (teaching aid)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This lives in lib/ rather than engine/fixedCalendar/ for the same
 * reason khDeclination does: the engine's fixed-calendar module stops
 * where the astronomical pipeline needs it (the mean molad), and these
 * rules serve the book's chapters 7-8 only.
 *
 * The verification is the strongest available anywhere in this
 * project: the output of these rules IS the Jewish calendar, so every
 * Rosh HaShanah they produce is checked against hebcal's — which is
 * checked against the world's — across centuries, in fixedYear.test.js.
 */
import {
  BAHARAD_PARTS_OFFSET,
  SYNODIC_MONTH_PARTS,
  PARTS_PER_DAY,
  PARTS_PER_HOUR,
} from '../engine/fixedCalendar/constants';
import { isHebrewLeapYear, monthsFromYear1ToTishrei } from '../engine/fixedCalendar/months';
import { HDate } from '../engine/epochDays';

const PARTS_PER_WEEK = 7 * PARTS_PER_DAY;

/**
 * The mean molad of Tishrei for a Hebrew year, as day-of-week (1 =
 * Sunday … 7 = Shabbat), hours (0-23 from the 6 PM evening start) and
 * parts (0-1079) — the three numbers KH 6 does all its arithmetic in.
 */
export function moladTishrei(year) {
  const months = monthsFromYear1ToTishrei(year);
  const total = BAHARAD_PARTS_OFFSET + months * SYNODIC_MONTH_PARTS;
  const withinWeek = ((total % PARTS_PER_WEEK) + PARTS_PER_WEEK) % PARTS_PER_WEEK;
  const dayIndex = Math.floor(withinWeek / PARTS_PER_DAY); // 0 = Sunday
  const rest = withinWeek - dayIndex * PARTS_PER_DAY;
  return {
    day: dayIndex + 1, // 1 = Sunday … 7 = Shabbat
    hours: Math.floor(rest / PARTS_PER_HOUR),
    parts: rest % PARTS_PER_HOUR,
  };
}

/**
 * KH 7's four postponements, applied in order. Returns the weekday of
 * Rosh HaShanah (1 = Sunday … 7 = Shabbat) and which rules fired.
 *
 *  1. מולד זקן (7:2) — molad at noon (18h) or later: postpone a day.
 *  2. לא אד"ו ראש (7:1, 7:3) — never Sunday, Wednesday, Friday:
 *     postpone a day (this can follow rule 1, making two days).
 *  3. ג"ט ר"ד (7:4) — common year, molad Tuesday at 9h 204p or later:
 *     Rosh HaShanah moves to Thursday.
 *  4. בט"ו תקפ"ט (7:5) — year after a leap year, molad Monday at
 *     15h 589p or later: Rosh HaShanah moves to Tuesday.
 */
export function roshHashanah(year) {
  const molad = moladTishrei(year);
  let day = molad.day;
  const applied = [];

  const moladParts = molad.hours * PARTS_PER_HOUR + molad.parts;

  if (moladParts >= 18 * PARTS_PER_HOUR) {
    day = (day % 7) + 1;
    applied.push('molad-zaken');
  } else if (molad.day === 3 && !isHebrewLeapYear(year) && moladParts >= 9 * PARTS_PER_HOUR + 204) {
    // GaTRaD: stated as "to Thursday" — one step to Wednesday would
    // land on אד"ו anyway; recording it as its own rule keeps his
    // numbering. The אד"ו step below completes the move.
    day = 4;
    applied.push('gatrad');
  } else if (
    molad.day === 2 &&
    isHebrewLeapYear(year - 1) &&
    moladParts >= 15 * PARTS_PER_HOUR + 589
  ) {
    day = 3;
    applied.push('betutkpat');
  }

  if ([1, 4, 6].includes(day)) {
    day = (day % 7) + 1;
    applied.push('lo-adu');
  }

  return { molad, day, applied };
}

/** Weekday of 1 Tishrei according to the calendar actually in use. */
export function actualRoshHashanahDay(year) {
  const abs = new HDate(1, 'Tishrei', year).abs();
  // Rata Die: R.D. 1 is a Monday, so abs % 7 === 1 means Monday.
  const dow = ((abs % 7) + 7) % 7; // 0 = Sunday
  return dow + 1;
}

/**
 * KH 8:5-8 — the shape of a year from its length.
 *
 * Marcheshvan and Kislev are the two adjustable months; everything
 * else alternates full/lacking from Tishrei. The year's length names
 * its shape: lacking (חסרה), in-order (כסדרה), complete (שלמה).
 */
export function yearShape(year) {
  const length =
    new HDate(1, 'Tishrei', year + 1).abs() - new HDate(1, 'Tishrei', year).abs();
  const leap = isHebrewLeapYear(year);
  const kind =
    length === (leap ? 383 : 353) ? 'lacking'
    : length === (leap ? 384 : 354) ? 'in-order'
    : length === (leap ? 385 : 355) ? 'complete'
    : null;
  return {
    length,
    leap,
    kind,
    cheshvanFull: kind === 'complete',
    kislevFull: kind !== 'lacking',
  };
}
