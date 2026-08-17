/**
 * Chapter 19 of the plain-language book — the court's other questions.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The last chapter, and it answers questions the rest of the book never
 * asked. Not "can the moon be seen" — that was settled in 17 — but
 * "which way was the crescent tilted" and "how high did it stand". Both
 * were put to witnesses, so both need working out.
 *
 * Two things a reader needs flagged:
 *
 *   1. A NEW reference line. Chapters 16 and 17 measured everything
 *      against the sun's road. This chapter measures against the
 *      EQUATOR, and the two tilts then have to be combined. A reader
 *      who does not notice the switch will conflate them. Section 2.
 *   2. He opens by saying this chapter will not be exact, because it
 *      does not affect the verdict — and then gives a table good to
 *      about a fifth of a degree, which makes the apology unnecessary.
 *      That is worth pointing at, and it is the note the whole
 *      astronomical arc ends on. Sections 3 and 7.
 *
 * An earlier draft called it "the most accurate table in the book". That
 * is false and is now removed: KH 13:4's sun correction is tighter both
 * absolutely (0.009° against 0.214°) and as a fraction of what it
 * tabulates. The observation that survives is the apology, not a
 * ranking.
 */

export default {
  chapter: 19,
  sourceChapter: 19,
  title: "The court's other questions",
  hebrewTitle: 'כללים נוספים',
  subtitle:
    'Not "could it be seen" — that is settled. Which way was the crescent tilted, and how high did it stand? The court asked both, so both get worked out.',

  terms: [
    {
      plain: "how far from the equator",
      formal: 'the inclination of the degree',
      hebrew: null,
      gloss:
        "How far north or south of the equator a point on the sun's road lies. Never more than about 23½°. Modern astronomy calls it *declination*; he does not name it, only describes it.",
    },
    {
      plain: 'the equator',
      formal: 'the line through the middle of the earth',
      hebrew: null,
      gloss:
        "A **different** reference line from the one chapters 16 and 17 used. Those measured off the sun's road; this chapter measures off the equator, and the two tilts get combined.",
    },
    {
      plain: 'which way the horns point',
      formal: 'the direction of the crescent',
      hebrew: null,
      gloss:
        'One of the questions actually put to witnesses. It follows from how far from the equator the moon stands, and nothing else.',
    },
  ],

  recap: {
    settled: [
      'The complete method, from a date to a yes or a no.',
      'An honest sense of what that answer is worth, and how a court weighed it.',
      "The moon's true place, and its height off the sun's road.",
    ],
    thisChapter:
      'The Sages recorded that witnesses were asked which way the crescent was tilted, and how high it stood. Those are not the visibility question, and the earlier chapters give no way to answer them. This one does.',
    byTheEnd:
      'You will be able to say, for any evening, which way the moon\'s horns pointed and roughly how high it hung — the last two things a court would have asked.',
  },

  sections: [
    {
      id: 'why-at-all',
      heading: 'Why there is a nineteenth chapter',
      source: 'KH 19:1',
      nodeId: 'rules',
      body: [
        'The verdict was reached in chapter 17. So what is left?',
        'The answer is that the court did not only ask whether the moon had been seen. It asked witnesses **which way the crescent was tilted** and **how high in the sky it appeared** — questions with checkable answers, and therefore a way of testing whether someone had really looked.',
        'The Rambam quotes the Sages on this and then says, in effect, *since they asked, I had better show you how to work it out*. And he immediately adds a warning: what follows **will not be exact**, because this knowledge makes no difference to whether the moon is seen. Remember that; it comes back at the end of the chapter and it does not mean what you would expect.',
      ],
    },

    {
      id: 'new-line',
      heading: 'A different line to measure from',
      source: 'KH 19:2',
      nodeId: 'rules',
      body: [
        'First, a switch that is easy to miss and will muddle everything if you do miss it.',
        'Chapters 16 and 17 measured heights off **the sun\'s road**. This chapter measures off **the equator** — the line running round the middle of the earth, extended out into the sky.',
        'Those are two different lines, and they cross each other. The sun\'s road is itself tilted against the equator, by up to about **23½ degrees** — which is a lot; it is more than a spread hand at arm\'s length. It crosses the equator at exactly two points: the start of Taleh and the start of Moznayim.',
        'So six of the signs lie north of the equator and six lie south. And when the sun is at either crossing it rises due east and sets due west, and day and night are equal the world over. That is the equinox, falling out of the geometry as a by-product.',
        'The upshot: the moon\'s distance from the equator is **two tilts added together** — how far its own degree of the sun\'s road sits from the equator, plus its own height off that road. Combining them is what this chapter is for.',
      ],
      interactive: 'declination',
    },

    {
      id: 'the-table',
      heading: 'The last table in the book',
      source: 'KH 19:7',
      nodeId: 'rules',
      body: [
        'He gives the tilt every ten degrees along the sun\'s road, starting from Taleh: 10 degrees along is 4 from the equator, 20 is 8, 30 is 11½, and so on to 90, which is the full 23½.',
        'Between rows, share out the difference — the same method as the sun, the moon, and the moon\'s height. And past 90 degrees, fold the circle in four, exactly as chapter 16 did. He says so explicitly, pointing back to the moon\'s-latitude method rather than restating it.',
        'By this point in the book that should feel routine, and that is the real lesson of the chapter: a table, an interpolation, a fold. The fourth time you meet the pattern it is no longer a pattern, it is just how the work is done.',
      ],
    },

    {
      id: 'combining',
      heading: 'Putting the two tilts together',
      source: 'KH 19:10',
      nodeId: 'rules',
      body: [
        'Now the combination, and the rule is what you would hope.',
        'If the degree\'s tilt and the moon\'s own height are **the same direction** — both north, or both south — add them. If they are **opposite**, take the smaller from the larger and keep the direction of the larger.',
        'He works his usual evening. The moon stands in the nineteenth degree of Shor, whose tilt from the equator is about **18 degrees north**. The moon\'s own height is about **4 degrees south**. Opposite directions, so subtract: the moon sits **14 degrees north of the equator**.',
      ],
      interactive: 'moon-from-equator',
    },

    {
      id: 'the-horns',
      heading: 'Which way the horns point',
      source: 'KH 19:12',
      nodeId: 'rules',
      body: [
        'And here is the payoff — the most physical, checkable thing in the whole book.',
        'From that one number, how far the moon stands from the equator, the crescent\'s appearance follows:',
        '**On the equator**, or within two or three degrees of it: the moon appears **due west**, and its horns point **due east**.',
        '**North of the equator**: it appears in the **north-west**, horns pointing **south-east**.',
        '**South of the equator**: it appears in the **south-west**, horns pointing **north-east**.',
        'And the further from the equator, the more pronounced the tilt.',
        'Notice what this gave a court. A witness who had genuinely seen the moon could say which way it leaned; a witness who had not would have to guess, and there were three answers to guess between. It is a check that costs nothing to ask and is very hard to fake.',
      ],
      interactive: 'crescent-direction',
    },

    {
      id: 'how-high',
      heading: 'And how high did it stand?',
      source: 'KH 19:15',
      nodeId: 'rules',
      body: [
        'The other question, and this one needs no new machinery at all.',
        'How high the moon appeared follows from **the final figure** — the arc of sighting from chapter 17. A short arc and the moon hung low, close to the horizon. A long arc and it stood well up.',
        'Which is neat, because it means the number that decides *whether* the moon can be seen also tells you *where in the sky* to expect it. One quantity, two uses, and the second one arrives free.',
      ],
    },

    {
      id: 'the-ending',
      heading: 'How he chooses to finish',
      source: 'KH 19:16',
      nodeId: 'rules',
      body: [
        'Two things about the end of this chapter are worth more than the arithmetic in it.',
        'The first is a small joke the text plays on itself, though not deliberately. He opened by apologising that this chapter would not be exact, since none of it affects the verdict. His tilt table then turns out to be right to about **a fifth of a degree** at every row — measured against the real geometry, which he had no way to compute. The apology was not needed.',
        'The second is his closing sentence. He has explained all of it, he says, so that everything will be clear to people of understanding, "and they will not lack awareness of any of the Torah\'s paths" — so that a student would **not need to go looking in other books** for it. Then he quotes Isaiah: *"Seek out of the book of God, read it. None of these will be lacking."*',
        'Which is a fair description of what he had just done. Nine chapters of astronomy, tables, worked examples and honest admissions of approximation, written into a code of law so that nobody studying it would have to go elsewhere. And, four chapters earlier, the remark that it does not matter whether the person who first worked these things out was a prophet or a gentile, provided the proof holds.',
        'That is where the astronomy ends.',
      ],
    },
  ],

  closing: {
    have: [
      'Which way the crescent pointed, on any evening, and roughly how high it hung.',
      "The moon's distance from the equator — two tilts combined.",
      'The whole of the Rambam\'s sighting method, from counting days to examining witnesses.',
    ],
    missing: [
      'Nothing more of the astronomy — this was the last of it. What lies outside these nine chapters is the other half of the laws: the court, the witnesses, the leap years, and the fixed reckoning that replaced sighting when the court ceased. Those are chapters 1 to 10, and they are a different kind of reading. They are all in the source text.',
    ],
  },
};
