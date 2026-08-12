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
const CourseFromApogee = React.lazy(() => import('./CourseFromApogee'));
const CorrectionTriangle = React.lazy(() => import('./CorrectionTriangle'));
const WhereCorrectionVanishes = React.lazy(() => import('./WhereCorrectionVanishes'));
const CorrectionTable = React.lazy(() => import('./CorrectionTable'));
const FoldPastHalfCircle = React.lazy(() => import('./FoldPastHalfCircle'));
const FoldPractice = React.lazy(() => import('./FoldPractice'));
const InterpolateRows = React.lazy(() => import('./InterpolateRows'));
const InterpolatePractice = React.lazy(() => import('./InterpolatePractice'));
const RoundingRule = React.lazy(() => import('./RoundingRule'));
const SunTruePosition = React.lazy(() => import('./SunTruePosition'));
const TekufahFinder = React.lazy(() => import('./TekufahFinder'));

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
  // Chapter 13 gets a tool on every halacha, each doing the one thing
  // its halacha does. 13:6 and 13:8 are the Rambam repeating 13:5 and
  // 13:7 with fresh numbers and telling the student to carry on the
  // same way — so those two practise rather than re-explain, which is
  // what those halachot are for. A second widget demonstrating the fold
  // would only repeat the one above it.
  13: [
    { id: 'course-from-apogee', after: 1, Component: CourseFromApogee },
    // Restores the figure Touger's footnote on 13:2 refers to, which the
    // digitised text does not carry.
    { id: 'correction-triangle', after: 2, Component: CorrectionTriangle },
    { id: 'correction-vanishes', after: 3, Component: WhereCorrectionVanishes },
    { id: 'correction-table', after: 4, Component: CorrectionTable },
    { id: 'fold-past-half', after: 5, Component: FoldPastHalfCircle },
    { id: 'fold-practice', after: 6, Component: FoldPractice },
    { id: 'interpolate-rows', after: 7, Component: InterpolateRows },
    { id: 'interpolate-practice', after: 8, Component: InterpolatePractice },
    { id: 'rounding-rule', after: 9, Component: RoundingRule },
    { id: 'sun-true-position', after: 10, Component: SunTruePosition },
    { id: 'tekufah-finder', after: 11, Component: TekufahFinder },
  ],
};

/** Interactives for a chapter, or an empty array. */
export function interactivesForChapter(chapter) {
  return INTERACTIVES[chapter] || [];
}
