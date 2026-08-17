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
 * ── Two sources of figures ──
 * Most of these are the calculators already built for `/text`, reused
 * unchanged. They are written, tested, and pinned against the Rambam's
 * own worked examples; rebuilding parallel versions for the book would
 * have meant two things to keep correct instead of one. They open by
 * default here and stay collapsed in `/text` because `BookChapter`
 * provides a different `FigureDefaults` context — see InteractiveCard.
 *
 * The rest are book-only, written where chapter 14 needed a picture the
 * source reader never had (the epicycle, the sunset drift).
 *
 * Ids are stable and prose-facing, so they read sensibly in a content
 * module: `figure: 'zodiac-position'`, not `figure: 'ZodiacPosition'`.
 */
import React from 'react';

// ── Book-only figures ──
const Epicycle = React.lazy(() => import('./Epicycle'));
const TwoSpeeds = React.lazy(() => import('./TwoSpeeds'));
const MoonMeanByBlocks = React.lazy(() => import('./MoonMeanByBlocks'));
const SunsetDrift = React.lazy(() => import('./SunsetDrift'));
const SeasonBands = React.lazy(() => import('./SeasonBands'));
const DoubleElongation = React.lazy(() => import('./DoubleElongation'));
const MoonCorrectionTable = React.lazy(() => import('./MoonCorrectionTable'));
const MoonTruePosition = React.lazy(() => import('./MoonTruePosition'));
const MoonTilt = React.lazy(() => import('./MoonTilt'));
const NodeMarch = React.lazy(() => import('./NodeMarch'));
const LatitudeTable = React.lazy(() => import('./LatitudeTable'));
const MoonLatitude = React.lazy(() => import('./MoonLatitude'));
const QuickVerdict = React.lazy(() => import('./QuickVerdict'));
const ParallaxBySign = React.lazy(() => import('./ParallaxBySign'));
const VisibilityChain = React.lazy(() => import('./VisibilityChain'));
const SightingLimits = React.lazy(() => import('./SightingLimits'));
const HowMarginal = React.lazy(() => import('./HowMarginal'));
const EastWest = React.lazy(() => import('./EastWest'));
const TonightHere = React.lazy(() => import('./TonightHere'));
const SliceShape = React.lazy(() => import('./SliceShape'));
const StretchShape = React.lazy(() => import('./StretchShape'));
const DegreeScale = React.lazy(() => import('./DegreeScale'));
const Declination = React.lazy(() => import('./Declination'));
const MoonFromEquator = React.lazy(() => import('./MoonFromEquator'));
const CrescentDirection = React.lazy(() => import('./CrescentDirection'));

// ── Reused from /text, chapter 11 ──
const ZodiacPosition = React.lazy(() => import('../../text/interactives/ZodiacPosition'));
const SexagesimalArithmetic = React.lazy(() =>
  import('../../text/interactives/SexagesimalArithmetic'),
);
const MeanVsTrueMotion = React.lazy(() => import('../../text/interactives/MeanVsTrueMotion'));
const EpochCounter = React.lazy(() => import('../../text/interactives/EpochCounter'));
const JerusalemCoordinates = React.lazy(() =>
  import('../../text/interactives/JerusalemCoordinates'),
);

// ── Reused from /text, chapter 12 ──
const HiddenThird = React.lazy(() => import('../../text/interactives/HiddenThird'));
const SunMeanPosition = React.lazy(() => import('../../text/interactives/SunMeanPosition'));
const SunApogee = React.lazy(() => import('../../text/interactives/SunApogee'));

// ── Reused from /text, chapter 13 ──
const CourseFromApogee = React.lazy(() => import('../../text/interactives/CourseFromApogee'));
const CorrectionTriangle = React.lazy(() => import('../../text/interactives/CorrectionTriangle'));
const WhereCorrectionVanishes = React.lazy(() =>
  import('../../text/interactives/WhereCorrectionVanishes'),
);
const CorrectionTable = React.lazy(() => import('../../text/interactives/CorrectionTable'));
const InterpolateRows = React.lazy(() => import('../../text/interactives/InterpolateRows'));
const RoundingRule = React.lazy(() => import('../../text/interactives/RoundingRule'));
const SunTruePosition = React.lazy(() => import('../../text/interactives/SunTruePosition'));
const TekufahFinder = React.lazy(() => import('../../text/interactives/TekufahFinder'));

export const FIGURES = {
  // chapter 11
  'zodiac-position': ZodiacPosition,
  sexagesimal: SexagesimalArithmetic,
  'mean-vs-true': MeanVsTrueMotion,
  'epoch-counter': EpochCounter,
  jerusalem: JerusalemCoordinates,

  // chapter 12
  'hidden-third': HiddenThird,
  'sun-mean': SunMeanPosition,
  'sun-apogee': SunApogee,

  // chapter 13
  course: CourseFromApogee,
  'correction-triangle': CorrectionTriangle,
  'correction-vanishes': WhereCorrectionVanishes,
  'correction-table': CorrectionTable,
  interpolate: InterpolateRows,
  rounding: RoundingRule,
  'sun-true': SunTruePosition,
  tekufah: TekufahFinder,

  // chapter 14
  epicycle: Epicycle,
  'two-speeds': TwoSpeeds,
  'moon-mean': MoonMeanByBlocks,
  'sunset-season': SunsetDrift,
  'season-table': SeasonBands,

  // chapter 15
  'double-elongation': DoubleElongation,
  'moon-correction-table': MoonCorrectionTable,
  'moon-true': MoonTruePosition,

  // chapter 16
  'moon-tilt': MoonTilt,
  'node-march': NodeMarch,
  'latitude-table': LatitudeTable,
  'moon-latitude': MoonLatitude,

  // chapter 17
  'quick-verdict': QuickVerdict,
  'parallax-by-sign': ParallaxBySign,
  'visibility-chain': VisibilityChain,
  'sighting-limits': SightingLimits,

  // chapter 18
  'how-marginal': HowMarginal,
  'east-west': EastWest,
  'tonight-here': TonightHere,
  'slice-shape': SliceShape,
  'stretch-shape': StretchShape,

  // chapter 11 — a sense of scale for every angle that follows
  'degree-scale': DegreeScale,

  // chapter 19
  declination: Declination,
  'moon-from-equator': MoonFromEquator,
  'crescent-direction': CrescentDirection,
};

/** The component for a slot id, or null if the id is unknown. */
export function figureById(id) {
  return FIGURES[id] || null;
}

/** Every registered slot id — used by the structural test. */
export function figureIds() {
  return Object.keys(FIGURES);
}
