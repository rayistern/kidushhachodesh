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

export const INTERACTIVES = {
  11: [
    { id: 'zodiac-position', after: 9, Component: ZodiacPosition },
    { id: 'sexagesimal', after: 12, Component: SexagesimalArithmetic },
    { id: 'mean-vs-true', after: 15, Component: MeanVsTrueMotion },
    { id: 'epoch-counter', after: 16, Component: EpochCounter },
    { id: 'jerusalem', after: 17, Component: JerusalemCoordinates },
  ],
};

/** Interactives for a chapter, or an empty array. */
export function interactivesForChapter(chapter) {
  return INTERACTIVES[chapter] || [];
}
