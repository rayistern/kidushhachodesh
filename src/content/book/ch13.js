/**
 * Chapter 13 of the plain-language book — the sun's true position.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The chapter that completes the sun and, in doing so, teaches the
 * shape every later correction follows: find how far round you are from
 * a reference point, look the answer up in a table, apply it in the
 * direction the position dictates.
 *
 * KH 13 is unusually generous with worked examples — it interpolates
 * twice and then runs a full calculation through to a constellation —
 * so the book leans on his own numbers throughout rather than inventing
 * any.
 *
 * The reality check belongs here rather than later: this is the first
 * point in the book where a *finished* position exists and can be held
 * up against the actual sky.
 */

export default {
  chapter: 13,
  sourceChapter: 13,
  title: 'Where the sun really is',
  hebrewTitle: 'מקום השמש האמיתי',
  subtitle:
    'The correction that turns the average into the real thing — and the pattern every later correction copies.',

  terms: [
    {
      plain: 'how far round from the far point',
      formal: 'the course',
      hebrew: 'מסלול',
      gloss:
        "One subtraction — the average place less the far point. Everything else in the chapter is looked up by this single number, including which direction the correction goes.",
    },
    {
      plain: 'the fix',
      formal: 'the angle of the course',
      hebrew: 'מנת המסלול',
      gloss:
        'How much to shift the average place to get the real one. Never more than 1° 59′ for the sun — about two moon-widths.',
    },
    {
      plain: 'real place',
      formal: 'the true position',
      hebrew: 'מקום השמש האמיתי',
      gloss:
        'Where you would actually see the sun, once the average has been corrected. The first finished answer in the book.',
    },
    {
      plain: 'sharing out the difference',
      formal: 'interpolating',
      hebrew: null,
      gloss:
        'The table gives every tenth degree. For anything in between, see how much the answer moves across those ten degrees, divide by ten, and step forward from the lower row.',
    },
  ],

  recap: {
    settled: [
      "The sun's **average** position on any date, worked out by adding published chunks.",
      'The position of the **far point** (govah) on that same date.',
      'The reason those are not yet the answer: we watch from off-centre.',
    ],
    thisChapter:
      'This chapter closes the gap. It takes the two numbers chapter 12 produced, measures the distance between them, and uses that distance to look up exactly how wrong the average is — and in which direction.',
    byTheEnd:
      "You'll have the sun's true position on any evening. That is half of everything the book needs; the moon is the other half.",
  },

  sections: [
    {
      id: 'the-course',
      heading: 'One subtraction, and everything hangs on it',
      source: 'KH 13:1',
      nodeId: 'sun-true',
      body: [
        'The chapter opens with a single instruction: take the far point away from the average position.',
        'What you get is called the **course** — the *maslul* (מסלול). It answers one question: how far round the circle has the sun travelled since it last passed the point furthest from us?',
        'That one number decides the rest. Its size sets how big the correction is; whether it is more or less than half a circle sets which way the correction goes. Nothing else in the chapter needs anything more.',
      ],
      interactive: 'course',
    },

    {
      id: 'which-way',
      heading: 'Why it is sometimes taken away and sometimes added',
      source: 'KH 13:2',
      nodeId: 'sun-true',
      body: [
        'The rule is: if the course is **less than half a circle**, subtract the correction from the average. If it is **more**, add it.',
        'That can look arbitrary, but it falls straight out of the geometry. Coming away from the far point, the sun is on the slow side of its circle, so it lags behind where steady motion would have put it — you subtract. Coming back round on the near side it is running ahead — you add.',
        "Touger's notes on this halacha include a small geometric proof, and refer you to a diagram. That diagram is in the printed book and did not survive into the digital text, so the figure below restores it — with his own letters, and with the conclusion stated correctly (the digitised text has lost a plus sign and reads as nonsense).",
      ],
      interactive: 'correction-triangle',
    },

    {
      id: 'nothing-to-do',
      heading: 'Two places where there is nothing to correct',
      source: 'KH 13:3',
      nodeId: 'sun-true',
      body: [
        'At exactly half a circle, and at exactly a full one, the correction is zero — the average position *is* the true position.',
        'The reason is easy to see and hard to forget: those are the only two places where the sun, the centre of its circle, and we ourselves all fall on one straight line. When that happens, the direction from the centre and the direction from here are the same direction. There is no gap to close.',
        'Everywhere else the two pull apart, which is what the correction measures.',
      ],
      interactive: 'correction-vanishes',
    },

    {
      id: 'the-table',
      heading: 'The table of corrections',
      source: 'KH 13:4',
      nodeId: 'sun-true',
      body: [
        'Now the answers themselves — **the fix** to apply. The Rambam lists it for every ten degrees of course, from nothing up to a maximum and back down to nothing.',
        'In the text it is nineteen lines of prose and hard to see any shape in. Plotted, it is obviously a smooth arch: zero at the start, rising to **1° 59\'** when the course is 90 degrees, falling back to zero at 180.',
        'Two degrees, at most. That is the entire size of the difference between the pretend sun and the real one — small, but far too big to ignore when the whole question turns on a few degrees of angle.',
      ],
      interactive: 'correction-table',
    },

    {
      id: 'between-rows',
      heading: 'When your course is not a round number',
      source: 'KH 13:7',
      nodeId: 'sun-true',
      body: [
        'The table gives every tenth degree. Real courses are rarely so obliging.',
        'The instruction is simple sharing-out. Take the two rows either side of your number, see how much the answer changes across those ten degrees, divide by ten to get the change per degree, and step forward from the lower row.',
        'He works it twice — for 65 degrees and again for 67 — which is his way of saying: this is the method, use it everywhere, including on the moon\'s table later.',
      ],
      interactive: 'interpolate',
    },

    {
      id: 'rounding',
      heading: 'How much precision he throws away, and why',
      source: 'KH 13:9',
      nodeId: 'sun-true',
      body: [
        'Two instructions here are easy to skim past, and together they set how precise this whole chapter is.',
        'First: before looking the course up, **discard its minutes**. Under thirty, drop them; thirty or more, count another degree. The table is read with whole numbers only.',
        'Second: **ignore the seconds** of a position entirely — in this calculation and in every other one to do with sighting.',
        'This is the licence from chapter 11 being spent. He is not failing to be precise; he is declining to be, having judged that the leftovers cannot change whether the moon is seen. The figure below puts an actual number on what each rounding costs, so you can weigh that judgement rather than take it on trust.',
      ],
      interactive: 'rounding',
    },

    {
      id: 'all-together',
      heading: 'The whole thing, start to finish',
      source: 'KH 13:10',
      nodeId: 'sun-true',
      body: [
        'The Rambam now runs the entire calculation through for a single evening, and helpfully it is the same evening chapter 12 used — a hundred days after the starting point.',
        'Average position, far point, subtract to get the course, round it, look up the correction, apply it in the direction the course dictates. Six steps, and he states the answer: the sun stands in Sartan, a whisker short of fifteen degrees into the sign.',
        'The calculator below walks all six, marking each figure he states outright. It also does something he could not: it shows you where the sun **actually** was that evening, by modern reckoning.',
        "The gap is about half a degree, and his sun runs a little behind. It is worth seeing. It is also worth knowing that the gap does not grow — it is no larger today than it was in his own lifetime, which tells you his method is sound and its starting values slightly off, rather than the other way round.",
      ],
      interactive: 'sun-true',
    },

    {
      id: 'payoff',
      heading: 'What this suddenly lets you do',
      source: 'KH 13:11',
      nodeId: 'sun-true',
      body: [
        'The chapter ends by pointing out something you may not have noticed you can now do.',
        'If you can find the sun\'s true position on any day, you can run the question backwards: pick a position and hunt for the day the sun reaches it. The seasons begin at the four quarter-points of the circle — so you can now find the true equinoxes and solstices, for any year, forwards or back.',
        'One honest note on the figure below. His answers come out as whole days, not times of day, and that is not a limitation of the calculator — his day count is in whole days and his table is read in whole degrees, so a day is genuinely the finest answer his method carries. The modern column beside it can give you the minute.',
      ],
      interactive: 'tekufah',
    },
  ],

  closing: {
    have: [
      "The sun's **true** position on any evening — the first finished answer in the book.",
      'The pattern every later correction follows: measure how far round you are from a reference point, look it up, apply it in the direction your position dictates.',
      'A sense of how close his sun is to the real one, and in which direction it errs.',
    ],
    missing: [
      'The moon — which is most of the difficulty. The sun needed one circle and one correction. The moon needs two circles, two speeds, and a correction that depends on where the sun is. That starts in chapter 14.',
    ],
  },
};
