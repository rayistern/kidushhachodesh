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
 * The same molad, reached the way KH 6:12-14 teaches a reader to reach
 * it — so a surface can show the work, not just the answer.
 *
 * From the anchor, count the elapsed years since year 1; take whole
 * 19-year cycles, then classify the leftover years of the current cycle
 * as common or leap (KH 6:11's positions 3, 6, 8, 11, 14, 17, 19); add
 * each class's published remainder that many times, throwing away whole
 * weeks as you go. Every step is returned as the day–hour–part triple
 * the chapter does all its arithmetic in: `each × count = add`,
 * accumulating through `running`. The last running total must equal
 * moladTishrei's answer — the two routes differ only in bookkeeping —
 * and fixedYear.test.js holds them to that.
 */
export function moladTishreiLadder(year) {
  if (year < 1) throw new Error(`Hebrew year must be >= 1, got ${year}`);
  const MONTH = SYNODIC_MONTH_PARTS;
  const week = (parts) => ((parts % PARTS_PER_WEEK) + PARTS_PER_WEEK) % PARTS_PER_WEEK;
  // An amount of parts as a d–h–p triple (days 0-6, an interval).
  const amount = (parts) => {
    const w = week(parts);
    const day = Math.floor(w / PARTS_PER_DAY);
    const rest = w - day * PARTS_PER_DAY;
    return { day, hours: Math.floor(rest / PARTS_PER_HOUR), parts: rest % PARTS_PER_HOUR };
  };
  // A position in the week as a weekday triple (1 = Sunday … 7 = Shabbat).
  const position = (parts) => {
    const a = amount(parts);
    return { ...a, day: a.day + 1 };
  };

  const elapsed = year - 1;
  const cycles = Math.floor(elapsed / 19);
  const remainderYears = elapsed % 19;
  const leapPositions = [];
  for (let i = 1; i <= remainderYears; i++) {
    if (isHebrewLeapYear(cycles * 19 + i)) leapPositions.push(i);
  }
  const leapYears = leapPositions.length;
  const commonYears = remainderYears - leapYears;

  const CYCLE_REM = week(235 * MONTH);
  const COMMON_REM = week(12 * MONTH);
  const LEAP_REM = week(13 * MONTH);

  let running = week(BAHARAD_PARTS_OFFSET);
  const steps = [];
  const push = (label, count, eachParts, ref) => {
    const add = week(count * eachParts);
    running = week(running + add);
    steps.push({
      label,
      count,
      each: amount(eachParts),
      add: amount(add),
      running: position(running),
      ref,
    });
  };
  push('19-year cycles', cycles, CYCLE_REM, 'KH 6:12');
  push('common years', commonYears, COMMON_REM, 'KH 6:5');
  push('leap years', leapYears, LEAP_REM, 'KH 6:5');

  return {
    anchor: position(week(BAHARAD_PARTS_OFFSET)),
    cycles,
    remainderYears,
    commonYears,
    leapYears,
    leapPositions,
    steps,
    final: position(running),
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
