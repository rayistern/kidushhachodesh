/**
 * Chapter 17 of the plain-language book — the answer.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The longest chapter in the book and the one everything else feeds.
 * Twenty-four halachot, an eight-step chain, and at the end a yes or a
 * no.
 *
 * The shape a reader most needs, and which the text does not announce:
 *
 *   1. Most nights never reach the long calculation at all. KH 17:3-4
 *      is an early exit that settles the great majority of cases on the
 *      elongation alone. Putting that first stops the chain looking
 *      like an unavoidable slog. Section 2.
 *   2. Every correction after that exists for one reason — the observer
 *      stands on the earth's surface, not at its centre (17:6). Once
 *      that is said, six baffling adjustments become one idea applied
 *      six ways. Section 3.
 *   3. The corrections are keyed by SIGN, which is the promise chapter
 *      11 made when it asked why the mazalot are named at all.
 *      Section 4.
 *
 * A textual wrinkle in KH 17:22 is surfaced rather than smoothed — see
 * the note in the verdict section and the pinning in ch17.test.js.
 */

export default {
  chapter: 17,
  sourceChapter: 17,
  title: 'Can it be seen?',
  hebrewTitle: 'קשת הראייה',
  subtitle:
    'Everything so far has been preparing three numbers. This chapter turns them into one number, and that number into a yes or a no.',

  recap: {
    settled: [
      "The sun's true position on any evening.",
      "The moon's true position on the same evening.",
      "The moon's height above or below the sun's track, north or south.",
    ],
    thisChapter:
      'Six chapters of machinery, all of it to answer one question the court actually asked: **will the new moon be visible tonight?** This is where it gets answered.',
    byTheEnd:
      'You will be able to take any evening and say whether the moon could have been seen from Jerusalem — which is the thing the whole book was built to do.',
  },

  sections: [
    {
      id: 'the-two-numbers',
      heading: 'Two numbers, and what they are called',
      source: 'KH 17:1',
      nodeId: 'arc',
      body: [
        'The chapter opens by naming the two things it will work with, and both are already in your hands.',
        'Subtract the sun\'s position from the moon\'s. That gap is the **first longitude** — how far the moon has pulled clear of the sun. It is the single most important number in the chapter, and you have been computing it since chapter 15 under a different name.',
        'The moon\'s height off the sun\'s track, from chapter 16, becomes the **first latitude**. Keep the direction with it; north and south behave differently from here on.',
        'The Rambam says to have both "at hand". He means it — they get used repeatedly, including right at the end, long after several rounds of adjustment have produced other numbers that look similar and are not the same.',
      ],
    },

    {
      id: 'early-exit',
      heading: 'Most nights never get any further than this',
      source: 'KH 17:3',
      nodeId: 'verdict',
      body: [
        'Before any of the hard work, the Rambam gives you a way out — and it settles the great majority of nights.',
        'If the first longitude is **nine degrees or less**, the moon cannot be seen. Anywhere in the land, no exceptions, stop calculating.',
        'If it is **more than fifteen degrees**, it will certainly be seen. Stop calculating.',
        'Only between those two does anything else in this chapter apply. That band is narrow, and the moon crosses it quickly — so on most evenings the whole apparatus below is simply not needed.',
        'There is a catch, and it is the sort that would quietly ruin an answer. Those thresholds hold only when the moon sits in one half of the sky — from the start of G\'di round to the end of Teomim. In the other half the numbers change: **ten degrees** for certain invisibility, **twenty-four** for certain visibility. That is a very different window, and which one applies depends on nothing but where the moon is.',
        'How much difference does that make? The undecided band is six degrees wide in one half of the sky and fourteen in the other — **nearly two and a half times wider**. So in one half you will rarely need the long calculation, and in the other you often will.',
        'Why the halves differ is the same reason chapter 11 gave for naming the signs at all: the belt meets the horizon at different angles in different parts of the year, and a moon setting at a shallow angle needs far more separation from the sun to clear the glare.',
      ],
      interactive: 'quick-verdict',
    },

    {
      id: 'why-corrections',
      heading: 'Why anything more is needed: you are not at the centre of the earth',
      source: 'KH 17:6',
      nodeId: 'arc',
      body: [
        'For the nights that do not resolve early, six adjustments follow, and taken one at a time they look arbitrary. They are not. Almost all of them come from a single fact, which the Rambam states plainly at 17:6.',
        'Every position computed so far has been the moon\'s place **as seen from the centre of the earth**. That is where the geometry of circles naturally puts you. But nobody observes from there. An observer stands on the surface, some four thousand miles off-centre, and from there the moon — which is close, as celestial things go — appears shifted against the background stars.',
        'The shift is called **parallax**, and it is not small. It moves the moon by up to about a degree, which is twice the moon\'s own width and easily enough to change the answer on a marginal night.',
        'So the true position has to be nudged into an *apparent* position. That takes two corrections, one for the sideways shift and one for the up-and-down, and they are the next two steps.',
      ],
    },

    {
      id: 'by-sign',
      heading: 'The corrections that depend on which sign the moon is in',
      source: 'KH 17:5',
      nodeId: 'arc',
      body: [
        'Here is the promise chapter 11 made coming due. Back then, the question was why the Rambam bothers naming the twelve signs when a position is already a number. This is the answer.',
        'The first correction takes minutes off the first longitude, and **how many depends on the sign the moon is in**: 59 minutes in Taleh, a full degree in Shor, 58 in Teomim, down to 34 in Moznayim and back up again. Twelve signs, twelve numbers. That gives the **second longitude**.',
        'The second does the same to the latitude, with its own set of twelve — 9 minutes in Taleh, 10 in Shor, up to 46 in Moznayim. And here the direction matters: if the moon is north of the sun\'s track you take the correction off, if south you add it on. That gives the **second latitude**.',
        'Neither table is arbitrary. Both are tracking the same thing — how the parallax shift breaks down into sideways and vertical parts, which depends on the angle the belt makes with the horizon, which depends on which stretch of the belt is setting. The sign is a shorthand for that angle.',
      ],
      interactive: 'parallax-by-sign',
    },

    {
      id: 'three-more',
      heading: 'Three more adjustments, and then a single number',
      source: 'KH 17:10',
      nodeId: 'arc',
      body: [
        'Three steps remain, and they are the fiddliest in the book. The good news is that a calculator can carry them and the ideas behind them are short.',
        '**Set aside a portion of the second latitude.** A fraction — two fifths, a third, a quarter, depending again on where the moon sits. The Rambam calls the result the **circuit of the moon**.',
        '**Apply it to the second longitude.** North, subtract; south, add — and reversed if the moon is in the other half of the sky. That gives the **third longitude**.',
        '**Stretch or shrink it.** Depending on which sign the third longitude falls in, add a sixth, or a fifth, or nothing, or subtract a fifth. That gives the **fourth longitude**. This one is about how steeply that part of the belt sets — the same underlying fact as the early-exit halves, applied more finely.',
        'Then, finally, go back to the **first** latitude — the one you were told to keep at hand — take a fraction of it, and apply that to the fourth longitude.',
        'What comes out is the **arc of sighting**, the קשת הראייה. One number, and the verdict depends on nothing else.',
      ],
      interactive: 'visibility-chain',
    },

    {
      id: 'the-verdict',
      heading: 'The answer',
      source: 'KH 17:15',
      nodeId: 'verdict',
      body: [
        'Nine degrees or less: not visible. More than fourteen: visible. Between the two, one more table — and it is the only place in the book where two numbers are weighed together.',
        'The rule is a sliding trade. A large arc of sighting can carry a small first longitude, and a large first longitude can carry a small arc. If the arc is between 11 and 12 degrees the first longitude must reach 11; if the arc is between 13 and 14 the first longitude need only reach 9. The bigger one gets, the less is asked of the other.',
        'For his worked evening the arc comes to **11 degrees and 11 minutes** and the first longitude to **11 degrees and 27 minutes** — so the moon would have been seen.',
        'A note on the text here, because you may notice it. At 17:22 the printed number for the longitude is *ten* degrees and 27 minutes, and he immediately concludes it is "greater than eleven" — which it is not. Ten degrees 27 is the **second** longitude, computed a few steps earlier. His conclusion follows from the **first** longitude, 11° 27′, which is the figure the rule actually asks for. Something has slipped in transmission between the numeral and the label; the reasoning is sound and the answer is right.',
      ],
      interactive: 'sighting-limits',
    },

    {
      id: 'his-closing',
      heading: 'What he says at the end of it',
      source: 'KH 17:23',
      nodeId: 'verdict',
      body: [
        'The Rambam closes the chapter by stepping back from it, and the two remarks he makes are worth more than most of the arithmetic.',
        'First, on why it was all so laborious. He says the effort went into finding a method that *comes close* without requiring impossibly complicated calculation — "because the moon has major incongruities in its orbit". Then he quotes the Sages: "The sun knows the time of its setting; the moon does not know the time of its setting." Every addition and subtraction in this chapter is that sentence worked out in numbers.',
        'Second, and more striking, he addresses where the knowledge came from. The proofs, he says, belong to astronomy and geometry, and the Greeks wrote many books on them. The books written by the sages of Israel on these matters have not reached us. And then: **since these things can be proven in a way that leaves no room for doubt, it does not matter whether the person who found them was a prophet or a gentile.**',
        'That is the standard the whole book has been held to, stated outright at the end. A demonstration stands on its demonstration.',
      ],
    },
  ],

  closing: {
    have: [
      'The complete method: a date in, a yes or a no out.',
      'The arc of sighting for any evening, and the two thresholds that usually settle it outright.',
      'Every quantity the court would have needed to test a witness who claimed to have seen the new moon.',
    ],
    missing: [
      'The edge cases, and the checks. Chapters 18 and 19 handle what to do when the answer sits close to the line, how the court used the calculation against testimony in practice, and the corrections for observers away from Jerusalem. The engine here follows chapters 11 to 17; those last two are still only in the Rambam\'s own words.',
    ],
  },
};
