/**
 * Figures the book's content modules can slot into a section.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SURFACE CATEGORY: internal UI (composition)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Content modules refer to figures by string id and never import a
 * component. That keeps `src/content/book/*` free of JSX so its tests
 * can run in the plain node environment and assert on the prose as
 * text — which is how every number printed in this book gets pinned.
 *
 * Lazy, so a chapter only loads the figures it actually uses.
 */
import React from 'react';

const Epicycle = React.lazy(() => import('./Epicycle'));
const TwoSpeeds = React.lazy(() => import('./TwoSpeeds'));
const MoonMeanByBlocks = React.lazy(() => import('./MoonMeanByBlocks'));
const SunsetDrift = React.lazy(() => import('./SunsetDrift'));
const SeasonBands = React.lazy(() => import('./SeasonBands'));

export const FIGURES = {
  epicycle: Epicycle,
  'two-speeds': TwoSpeeds,
  'moon-mean': MoonMeanByBlocks,
  'sunset-season': SunsetDrift,
  'season-table': SeasonBands,
};

/** The component for a slot id, or null if the id is unknown. */
export function figureById(id) {
  return FIGURES[id] || null;
}

/** Every registered slot id — used by the structural test. */
export function figureIds() {
  return Object.keys(FIGURES);
}
