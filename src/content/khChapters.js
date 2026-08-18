/**
 * Chapter metadata for the full Hilchot Kidush HaChodesh (all 19 chapters).
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **both** — chapters 1-10 are the sighting/fixed-calendar
 *  regime, chapters 11-19 are the astronomical regime.
 *  SURFACE CATEGORY: internal UI (chapter labels + navigation)
 * ═══════════════════════════════════════════════════════════════════
 *
 * The Rambam did not title the chapters of the Mishneh Torah — these
 * labels are editorial summaries of each chapter's subject, added so
 * the reader's table of contents is navigable. The chapter *numbers*
 * and halacha counts are authoritative; the titles are not quotations
 * and should never be cited as the Rambam's own words.
 *
 * Titles for 11-19 are carried over verbatim from the CHAPTER_TITLES
 * map in `src/components/content/RambamReader.jsx` so the two surfaces
 * label the same chapter identically.
 *
 * `SECTIONS` groups the chapters by halachic regime. That boundary is
 * real and load-bearing in this project: the astronomical engine only
 * implements chapters 11-19. See docs/OPEN_QUESTIONS.md Q3.
 */

export const CHAPTER_TITLES = {
  // ── Sighting, testimony, and the fixed calendar (KH 1-10) ──
  1: { en: 'Lunar Months and Sanctification by Sighting', he: 'חודשי הלבנה וקידוש על פי הראייה' },
  2: { en: 'Witnesses and Their Testimony', he: 'העדים ועדותם' },
  3: { en: 'The Court Receives Testimony and Proclaims', he: 'קבלת העדות וקידוש בית דין' },
  4: { en: 'Leap Years and Intercalation', he: 'עיבור השנה' },
  5: { en: "The Sanhedrin's Authority and the Fixed Reckoning", he: 'סמכות הסנהדרין והחשבון הקבוע' },
  6: { en: 'The Molad and the Mean Conjunction', he: 'המולד וחשבון האמצע' },
  7: { en: 'Postponements of Rosh HaShanah', he: 'דחיות ראש השנה' },
  8: { en: 'Month Lengths and the Types of Year', he: 'סדר החודשים וקביעות השנה' },
  9: { en: 'The Solar Year and the Tekufot', he: 'שנת החמה והתקופות' },
  10: { en: "The Precise Solar Year (Rav Ada's Reckoning)", he: 'תקופת רב אדא' },

  // ── The astronomical calculations (KH 11-19) ──
  11: { en: 'Astronomical Foundations', he: 'יסודות חשבון התקופות' },
  12: { en: 'Sun Mean Position', he: 'אמצע השמש' },
  13: { en: 'Sun True Position', he: 'מקום השמש האמיתי' },
  14: { en: 'Moon Mean Position', he: 'אמצע הירח' },
  15: { en: 'Moon True Position', he: 'מקום הירח האמיתי' },
  16: { en: "Moon's Latitude", he: 'רוחב הירח' },
  17: { en: 'Arc of Sighting', he: 'קשת הראייה' },
  18: { en: 'Visibility Conditions', he: 'תנאי הראייה' },
  19: { en: 'Additional Rules', he: 'כללים נוספים' },
};

/** Every chapter of Hilchot Kidush HaChodesh, in order. */
export const ALL_CHAPTERS = Array.from({ length: 19 }, (_, i) => i + 1);

/**
 * Halacha counts per chapter, as served by Sefaria (Torat Emet Hebrew
 * and the Touger English agree on every chapter). Used only to show a
 * count in the table of contents before the text has been fetched —
 * the rendered text always comes from the live API response, never
 * from this table.
 */
export const HALACHA_COUNTS = {
  1: 8, 2: 10, 3: 19, 4: 17, 5: 13, 6: 15, 7: 8, 8: 10, 9: 8, 10: 7,
  11: 17, 12: 2, 13: 11, 14: 6, 15: 9, 16: 19, 17: 24, 18: 16, 19: 16,
};

export const SECTIONS = [
  {
    id: 'sighting',
    en: 'Sighting, Testimony, and the Fixed Calendar',
    he: 'הראייה, העדות, והחשבון הקבוע',
    blurb:
      'How the court sanctified the month on the testimony of witnesses, how leap years were declared, and the fixed calendar that replaced the court after the Sanhedrin ceased.',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 'astronomical',
    en: 'The Astronomical Calculations',
    he: 'חשבון התקופות והגימטריאות',
    blurb:
      "The Rambam's own astronomy: mean and true positions of the sun and moon, the moon's latitude, and the arc of sighting that decides whether the new moon will be visible. This is the half the engine in this project implements.",
    chapters: [11, 12, 13, 14, 15, 16, 17, 18, 19],
  },
];

/** Section a chapter belongs to, or undefined for an out-of-range number. */
export function sectionForChapter(chapter) {
  return SECTIONS.find((s) => s.chapters.includes(chapter));
}

/** True when `n` is a real chapter of Hilchot Kidush HaChodesh. */
export function isValidChapter(n) {
  return Number.isInteger(n) && n >= 1 && n <= 19;
}
