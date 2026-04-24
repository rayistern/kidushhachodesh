/**
 * Fixed-calendar CalculationStep builders.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **fixed-calendar** (KH 6-10)
 *  SURFACE CATEGORY: internal step chain (Rambam-surface values embedded)
 * ═══════════════════════════════════════════════════════════════════
 * Each function here returns the same CalculationStep shape the
 * astronomical pipeline produces, but with `regime: 'fixed-calendar'`.
 * Drill-down chains stay within this regime by design (R3 enforcement
 * in `calculationStore.drillIntoInput`); the only bridge to the
 * astronomical side is the `daysFromEpoch` crossing step, which is
 * authored inside `sunCalculations.js` for historical reasons.
 *
 * Per docs/OPEN_QUESTIONS.md Q3 Option B: these steps power the
 * sidebar's molad display (labeling layer). They are NOT inputs to
 * KH 12-17 astronomical computation.
 */
import {
  BAHARAD,
  SYNODIC_MONTH,
  SYNODIC_MONTH_PARTS,
  BAHARAD_PARTS_OFFSET,
  PARTS_PER_HOUR,
  PARTS_PER_DAY,
  PARTS_PER_WEEK,
  HEBREW_DAY_NAMES,
  HEBREW_DAY_NAMES_HEBREW,
  HEBCAL_MONTH,
} from './constants.js';
import {
  isHebrewLeapYear,
  monthsInYear,
  monthsFromYear1ToTishrei,
  monthPositionInYear,
  monthsSinceBaharad,
} from './months.js';

/** BaHaRaD anchor — KH 6:8. The root of the whole calendar. */
export function baharadAnchorStep() {
  return {
    id: 'baharadAnchor',
    regime: 'fixed-calendar',
    name: 'BaHaRaD Anchor',
    hebrewName: 'בהר״ד',
    rambamRef: 'KH 6:8',
    source: 'rambam',
    sourceNote: 'Molad Tishrei of year 1 of creation — the Rambam fixes this as the spine of the fixed Hebrew calendar.',
    teachingNote: 'BaHaRaD = ב (day 2, Monday) ה (5 hours into the day) רד (204 parts into that hour). Hebrew days begin at 6 PM the previous civil evening, so BaHaRaD is Sunday evening 11:11 PM civil → Monday morning 5h 204p. Every future molad is computed as BaHaRaD + N × (mean synodic month).',
    inputs: {
      dayOfWeek: { value: BAHARAD.dayOfWeek, label: 'Day of Week (2 = Monday)' },
      hours: { value: BAHARAD.hours, label: 'Hours into the day', unit: 'h' },
      parts: { value: BAHARAD.parts, label: 'Chalakim', unit: 'parts' },
    },
    formula: 'BaHaRaD = Day 2 (Monday), 5h, 204 parts',
    result: BAHARAD_PARTS_OFFSET,
    formatted: `ב״ה״רד (Monday, 5h, 204p)`,
    unit: 'parts from start of week',
  };
}

/** Months elapsed since BaHaRaD up to the given date's month. */
export function monthsSinceBaharadStep(hDate) {
  const year = hDate.getFullYear();
  const hebcalMonth = hDate.getMonth();
  const tishreiMonths = monthsFromYear1ToTishrei(year);
  const positionInYear = monthPositionInYear(hebcalMonth, year);
  const totalMonths = tishreiMonths + positionInYear;
  return {
    id: 'monthsSinceBaharad',
    regime: 'fixed-calendar',
    name: 'Months Since BaHaRaD',
    hebrewName: 'חדשים מאז בהר״ד',
    rambamRef: 'KH 6:11, 11:4',
    source: 'rambam',
    sourceNote: 'Count of mean moladot from BaHaRaD (molad Tishrei year 1) to the molad of the given date\'s month. Uses the 19-year cycle of 235 months (12 years of 12 months + 7 leap years of 13 months).',
    teachingNote: 'Every molad after BaHaRaD is just BaHaRaD + (this number) × (synodic interval). The whole fixed calendar rides on this integer.',
    inputs: {
      year: { value: year, label: 'Hebrew Year' },
      hebcalMonth: { value: hebcalMonth, label: 'Month (hebcal numbering, 1=Nisan, 7=Tishrei)' },
      monthsToTishrei: { value: tishreiMonths, label: 'Months from BaHaRaD to Tishrei Y' },
      positionInYear: { value: positionInYear, label: 'Position in year (Tishrei=0)' },
      leapYear: { value: isHebrewLeapYear(year) ? 'Yes (13 months)' : 'No (12 months)', label: 'Leap Year?' },
    },
    formula: 'monthsFromYear1ToTishrei(year) + monthPositionInYear(month, year)',
    result: totalMonths,
    formatted: `${totalMonths.toLocaleString()} months`,
    unit: 'months',
  };
}

/**
 * Mean molad of the given date's month — the actual KH 6 output.
 * Keeps integer parts for exactness; derives weekday & h/p at the end.
 *
 * Returns a step whose `result` is the absolute-parts offset from
 * the start of Sunday of week 1 AM. The `formatted` is the traditional
 * "Day H'MP" string.
 */
export function meanMoladStep(hDate, monthsStep, baharadStep) {
  const months = monthsStep.result;
  const totalParts = BAHARAD_PARTS_OFFSET + months * SYNODIC_MONTH_PARTS;

  // Reduce to within a week for display, but keep full value as result
  const partsWithinWeek = ((totalParts % PARTS_PER_WEEK) + PARTS_PER_WEEK) % PARTS_PER_WEEK;
  const dayIndex = Math.floor(partsWithinWeek / PARTS_PER_DAY); // 0..6, 0 = Sunday
  const partsRemaining = partsWithinWeek - dayIndex * PARTS_PER_DAY;
  const hours = Math.floor(partsRemaining / PARTS_PER_HOUR);
  const parts = partsRemaining - hours * PARTS_PER_HOUR;
  const dayName = HEBREW_DAY_NAMES[dayIndex];
  const dayNameHe = HEBREW_DAY_NAMES_HEBREW[dayIndex];

  const monthName = hDate.getMonthName();
  return {
    id: 'meanMoladOfMonth',
    regime: 'fixed-calendar',
    name: 'Mean Molad of Month',
    hebrewName: 'מולד אמצעי',
    rambamRef: 'KH 6:3, 6:8',
    source: 'rambam',
    sourceNote: 'Mean molad = BaHaRaD + (months since BaHaRaD) × (29d 12h 793p). Reduced mod 7 days for weekday display.',
    teachingNote: 'This is the MEAN molad only — not the astronomical true conjunction, which can be up to ~14 hours off. The fixed calendar uses this mean molad (plus dehiyot) to determine Rosh Chodesh, not the actual sighted new moon.',
    inputs: {
      baharad: { value: baharadStep.result, label: 'BaHaRaD', refId: 'baharadAnchor' },
      monthsSinceBaharad: { value: months, label: 'Months since BaHaRaD', refId: 'monthsSinceBaharad' },
      synodicParts: { value: SYNODIC_MONTH_PARTS, label: 'Synodic month (parts)' },
    },
    formula: 'BaHaRaD + months × 29d 12h 793p  (mod 7 days for weekday)',
    result: partsWithinWeek,
    formatted: `${dayName} ${hours}h ${parts}p (${monthName})`,
    formattedHebrew: `${dayNameHe} ${hours} שעות ${parts} חלקים`,
    unit: 'parts within week',
    // Break out the display pieces so UI can render them prominently
    // without re-parsing the formatted string.
    display: {
      dayIndex,
      dayName,
      dayNameHebrew: dayNameHe,
      hours,
      parts,
      monthName,
    },
  };
}

/**
 * Orchestrates the fixed-calendar chain for a given Hebrew date.
 * Returns { steps: [...], stepMap: {...}, meanMolad: {...} } in a
 * shape compatible with the astronomical pipeline's output, so
 * `getFullCalculation` can merge them directly.
 */
export function runFixedCalendarChain(hDate) {
  const baharad = baharadAnchorStep();
  const months = monthsSinceBaharadStep(hDate);
  const molad = meanMoladStep(hDate, months, baharad);
  const steps = [baharad, months, molad];
  const stepMap = {};
  for (const s of steps) stepMap[s.id] = s;
  return {
    steps,
    stepMap,
    meanMolad: {
      dayIndex: molad.display.dayIndex,
      dayName: molad.display.dayName,
      dayNameHebrew: molad.display.dayNameHebrew,
      hours: molad.display.hours,
      parts: molad.display.parts,
      monthName: molad.display.monthName,
      formatted: molad.formatted,
    },
  };
}
