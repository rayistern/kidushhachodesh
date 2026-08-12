/**
 * Registry of in-text interactives, keyed by chapter.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal UI (composition)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Each entry says which halacha it follows (`after`, 1-indexed, matching
 * the numbering shown in the reader) so a card lands directly beneath
 * the passage it illustrates rather than in a lump at the foot of the
 * page. `TextChapter` reads this and nothing else — adding an
 * interactive to any chapter means adding a row here.
 *
 * Components are lazy so that chapters without interactives, and the
 * table of contents, do not carry their weight. The chapter route is
 * already inside a Suspense boundary.
 *
 * An entry whose `after` exceeds the number of halachot actually served
 * for that chapter renders at the end rather than vanishing — see the
 * placement logic in TextChapter.
 */
import React from 'react';

const ZodiacPosition = React.lazy(() => import('./ZodiacPosition'));
const SexagesimalArithmetic = React.lazy(() => import('./SexagesimalArithmetic'));
const MeanVsTrueMotion = React.lazy(() => import('./MeanVsTrueMotion'));
const EpochCounter = React.lazy(() => import('./EpochCounter'));
const JerusalemCoordinates = React.lazy(() => import('./JerusalemCoordinates'));
const SunMeanPosition = React.lazy(() => import('./SunMeanPosition'));
const HiddenThird = React.lazy(() => import('./HiddenThird'));
const SunApogee = React.lazy(() => import('./SunApogee'));
const CorrectionTable = React.lazy(() => import('./CorrectionTable'));
const SunTruePosition = React.lazy(() => import('./SunTruePosition'));

export const INTERACTIVES = {
  11: [
    { id: 'zodiac-position', after: 9, Component: ZodiacPosition },
    { id: 'sexagesimal', after: 12, Component: SexagesimalArithmetic },
    { id: 'mean-vs-true', after: 15, Component: MeanVsTrueMotion },
    { id: 'epoch-counter', after: 16, Component: EpochCounter },
    { id: 'jerusalem', after: 17, Component: JerusalemCoordinates },
  ],
  // Chapter 12 is only two halachot, and the second carries most of the
  // method — so the daily-rate card follows 12:1 and both the position
  // calculator and the apogee follow 12:2.
  12: [
    { id: 'hidden-third', after: 1, Component: HiddenThird },
    { id: 'sun-mean-position', after: 2, Component: SunMeanPosition },
    { id: 'sun-apogee', after: 2, Component: SunApogee },
  ],
  // Chapter 13 states the procedure (13:1-3), tabulates the correction
  // (13:4-8), then works the whole thing through (13:9-10). The table
  // card follows the table; the procedure card follows the example.
  13: [
    { id: 'correction-table', after: 8, Component: CorrectionTable },
    { id: 'sun-true-position', after: 10, Component: SunTruePosition },
  ],
};

/** Interactives for a chapter, or an empty array. */
export function interactivesForChapter(chapter) {
  return INTERACTIVES[chapter] || [];
}
