/**
 * The whole calculation as a chain of steps, in plain words.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **astronomical** (KH 11-19)
 *  SURFACE CATEGORY: teaching commentary (labels are editorial)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This is the spine of the book's map. Pure data and pure functions —
 * no React — so the ordering and the status logic can be tested without
 * a DOM, and so the map cannot drift from the engine: every node
 * carries the `stepId` of the real pipeline step it stands for, and a
 * test asserts each of those ids is genuinely produced.
 *
 * ── Why chapter 14 gets three nodes ──
 * Because that is the confusion this book exists to clear up. A reader
 * arriving at KH 14 meets what looks like one topic and is in fact
 * three separate quantities: where the small circle has got to, where
 * the moon sits on it, and the nudge that lands the answer at the
 * moment of sighting. Collapsing them into a single "chapter 14" node
 * would hide precisely the thing that makes the chapter hard.
 *
 * ── Labels ──
 * English first, as a question or a verb, never jargon. The Hebrew term
 * is secondary so the vocabulary is taught without being a gate. The
 * labels are editorial; the Hebrew names are the Rambam's.
 */

export const CHAIN_NODES = [
  {
    id: 'molad',
    label: 'Add up the average new moons',
    hebrew: 'מולד',
    chapter: 6,
    stepId: 'meanMoladOfMonth',
    blurb: 'One anchor, one interval, addition — the calendar\'s raw material.',
  },
  {
    id: 'rosh-hashanah',
    label: 'Fix the day Rosh HaShanah falls',
    hebrew: 'דחיות',
    chapter: 7,
    stepId: null,
    blurb: 'The molad proposes; four postponements dispose.',
  },
  {
    id: 'year-shape',
    label: 'Shape the year — every month\'s length',
    hebrew: 'קביעה',
    chapter: 8,
    stepId: null,
    blurb: 'Two Rosh HaShanahs force all the months between them.',
  },
  {
    id: 'days',
    label: 'Count the days since the starting point',
    hebrew: null,
    chapter: 11,
    stepId: 'daysFromEpoch',
    blurb: 'Everything is measured from one evening in 1178.',
  },
  {
    id: 'sun-mean',
    label: "Where the sun would be if it never changed speed",
    hebrew: 'אמצע השמש',
    chapter: 12,
    stepId: 'sunMeanLongitude',
    blurb: 'A steady, pretend sun. Easy to work out, but not what you see.',
  },
  {
    id: 'sun-true',
    label: 'Where the sun really is',
    hebrew: 'מקום השמש האמיתי',
    chapter: 13,
    stepId: 'sunTrueLongitude',
    blurb: 'The pretend sun, corrected by a table.',
  },
  {
    id: 'moon-mean',
    label: "Where the moon's small circle has got to",
    hebrew: 'אמצע הירח',
    chapter: 14,
    stepId: 'moonMeanLongitude',
    blurb: 'The first of the moon\'s two numbers.',
  },
  {
    id: 'moon-anomaly',
    label: 'Where the moon sits on that small circle',
    hebrew: 'אמצע המסלול',
    chapter: 14,
    stepId: 'moonMaslul',
    blurb: 'The second. Nearly the same speed, a completely different question.',
  },
  {
    id: 'season',
    label: 'Nudge it to the moment you can actually look',
    hebrew: null,
    chapter: 14,
    stepId: 'moonSeasonCorrection',
    blurb: 'Because sunset moves through the year.',
  },
  {
    id: 'double-elongation',
    label: 'How far the moon has pulled away from the sun',
    hebrew: 'מרחק כפול',
    chapter: 15,
    stepId: 'doubleElongation',
    blurb: 'Doubled, for reasons chapter 15 explains.',
  },
  {
    id: 'moon-true',
    label: 'Where the moon really is',
    hebrew: 'מקום הירח האמיתי',
    chapter: 15,
    stepId: 'moonTrueLongitude',
    blurb: 'The two numbers from chapter 14, finally combined.',
  },
  {
    id: 'latitude',
    label: "How far off the sun's track the moon is",
    hebrew: 'רוחב הירח',
    chapter: 16,
    stepId: 'moonLatitude',
    blurb: 'The moon does not run along the same line as the sun.',
  },
  {
    id: 'arc',
    label: 'Turn all of it into one number',
    hebrew: 'קשת הראייה',
    chapter: 17,
    stepId: 'keshetHaReiyah',
    blurb: 'The arc of sighting — the single figure the verdict turns on.',
  },
  {
    id: 'verdict',
    label: 'Can it be seen?',
    hebrew: null,
    // The verdict is KH 17:15-21, not 18 — the engine's own step carries
    // rambamRef 'KH 17:3-4, 17:15-21'. An earlier draft filed it under
    // 18 to give that chapter a node; the node below is the honest one.
    chapter: 17,
    stepId: 'moonVisibility',
    blurb: 'The answer the whole book was for.',
  },
  {
    id: 'limits',
    label: 'How far to trust the answer',
    hebrew: 'תנאי הראייה',
    chapter: 18,
    stepId: null,
    blurb: 'The calculation says "probable", not "certain" — and why that matters in court.',
  },
  {
    id: 'rules',
    label: 'The exceptions and the checks',
    hebrew: 'כללים נוספים',
    chapter: 19,
    stepId: null,
    blurb: 'What to do when the answer is close to the line.',
  },
];

/**
 * Where a node stands relative to where the reader is.
 *
 *   'here'    — the specific node being read right now (optional)
 *   'current' — belongs to the chapter being read
 *   'settled' — an earlier chapter has already covered it
 *   'ahead'   — still to come
 *
 * A pure function of position in the book. Deliberately NOT a claim
 * about what the reader has understood or visited — that would need
 * persistence, and it would be a lie the moment someone jumped in via a
 * link. "Settled" here means "the book has already explained this".
 */
export function chainStatus(node, currentChapter, activeNodeId = null) {
  if (activeNodeId && node.id === activeNodeId) return 'here';
  if (node.chapter === currentChapter) return 'current';
  if (node.chapter < currentChapter) return 'settled';
  return 'ahead';
}

/** The nodes belonging to one chapter, in order. */
export function nodesForChapter(chapter) {
  return CHAIN_NODES.filter((n) => n.chapter === chapter);
}

/** Look a node up by id. */
export function nodeById(id) {
  return CHAIN_NODES.find((n) => n.id === id) || null;
}

/** 1-based position of a node in the chain, for "step N of M". */
export function nodeIndex(id) {
  return CHAIN_NODES.findIndex((n) => n.id === id) + 1;
}
