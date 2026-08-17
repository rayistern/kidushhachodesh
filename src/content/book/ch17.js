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

  terms: [
    {
      plain: 'the gap',
      formal: 'the first longitude',
      hebrew: 'אורך ראשון',
      gloss:
        'How far the moon has pulled away from the sun, measured along the sun\'s own path. The number this whole chapter works on, and the one it keeps coming back to.',
    },
    {
      plain: 'the height',
      formal: 'the first latitude',
      hebrew: 'רוחב ראשון',
      gloss:
        "How far off the sun's path the moon sits, north or south — chapter 16's answer, brought in unchanged.",
    },
    {
      plain: 'the change in what you see',
      formal: 'the sighting adjustment',
      hebrew: 'שינוי המראה',
      gloss:
        "His own term, and it says exactly what it is: the moon's true place is not the place you see it in, and this is the difference. Every position so far has been the moon as seen from the **centre** of the earth; nobody stands there. Modern astronomy calls the same thing *parallax*.",
    },
    {
      plain: 'the slice',
      formal: 'the circuit of the moon',
      hebrew: 'מעגל הירח',
      gloss:
        'A fraction of the height — two fifths, a third, a quarter — set aside to be applied to the gap. Which fraction depends on where the moon is.',
    },
    {
      plain: 'the final figure',
      formal: 'the arc of sighting',
      hebrew: 'קשת הראייה',
      gloss:
        'What the gap has become after all four adjustments. The verdict depends on this and nothing else.',
    },
    {
      plain: 'the pass marks',
      formal: 'the sighting limits',
      hebrew: 'קיצי הראייה',
      gloss:
        'The short table for the nights that fall between the two flat cutoffs, pairing a range of final figures with the smallest gap that will do.',
    },
  ],

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
        'Subtract the sun\'s position from the moon\'s. That is **the gap** — how far the moon has pulled clear of the sun along the sun\'s own road. The text calls it the *first longitude*. It is the single most important number in the chapter, and you have been computing it since chapter 15 under a different name.',
        'The moon\'s height off the sun\'s road, from chapter 16, comes in as **the height** — the text\'s *first latitude*. Keep the direction with it; north and south behave differently from here on.',
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
        'If the gap is **nine degrees or less** — about one fist at arm\'s length — the moon cannot be seen. Anywhere in the land, no exceptions, stop calculating.',
        'If it is **more than fifteen degrees** — a fist and a half — it will certainly be seen. Stop calculating.',
        'Only between those two does anything else in this chapter apply. That band is narrow, and the moon crosses it quickly — so on most evenings the whole apparatus below is simply not needed.',
        'There is a catch, and it is the sort that would quietly ruin an answer. Those thresholds hold only when the moon sits in one half of the sky — from the start of G\'di round to the end of Teomim. In the other half the numbers change: **ten degrees** for certain invisibility, **twenty-four** for certain visibility. That is a very different window, and which one applies depends on nothing but where the moon is.',
        'How much difference does that make? The undecided band is six degrees wide in one half of the sky and fourteen in the other — **nearly two and a half times wider**. So in one half you will rarely need the long calculation, and in the other you often will.',
        'Why the halves differ is the same reason chapter 11 gave for naming the signs at all: the belt meets the horizon at different angles in different parts of the year, and a moon setting at a shallow angle needs far more separation from the sun to clear the glare.',
      ],
      interactive: 'quick-verdict',
    },

    {
      id: 'one-number',
      heading: 'There are not four longitudes',
      source: 'KH 17:1',
      nodeId: 'arc',
      body: [
        'Before the adjustments start, one thing about the naming, because it is the single most confusing feature of this chapter and it is entirely an accident of vocabulary.',
        'You are about to meet a **first longitude**, a **second longitude**, a **third longitude** and a **fourth longitude**. That sounds like four quantities to keep track of. It is not.',
        '**It is one number, adjusted four times.** The gap between the sun and the moon is worked out once, and then nudged — for standing on the ground, for the moon\'s height, for how steeply the sky sets — and after each nudge the text calls it by the next number along: second, then third, then fourth. On the evening the Rambam works through, that single running number goes:',
        '11° 27′ → 10° 27′ → 11° 28′ → 13° 46′ → and finally 11° 10′, which he calls the arc of sighting.',
        'The last one gets a name of its own instead of being called the fifth, but it is still the same running number, and it is the one the verdict is read from.',
        'So when the text says "the third longitude", read it as **"the gap, after two adjustments"**. Nothing is being introduced; something is being corrected. Hold on to the one number and the chapter becomes a list of four things done to it.',
      ],
    },

    {
      id: 'why-corrections',
      heading: 'Why anything more is needed: you are not at the centre of the earth',
      source: 'KH 17:6',
      nodeId: 'arc',
      body: [
        'For the nights that do not resolve early, six adjustments follow, and taken one at a time they look arbitrary. They are not. Almost all of them come from a single fact, which the Rambam states plainly at 17:6.',
        'Every position computed so far has been the moon\'s place **as seen from the centre of the earth**. That is where the geometry of circles naturally puts you. But nobody observes from there. An observer stands on the surface, some four thousand miles off-centre, and from there the moon — which is close, as celestial things go — appears shifted against the background stars.',
        'He has a name for the difference, and it is a better one than the modern word: **שינוי המראה**, *shinui hamar\'eh* — "the change in appearance". The moon\'s true place is not the place you see it in, and that is the change. Translations render it *the sighting adjustment*; modern astronomy calls the same thing *parallax*.',
        'It is not small. It moves the moon by up to about a degree — twice the moon\'s own width, or a finger held at arm\'s length — and easily enough to change the answer on a marginal night.',
        'And it always moves it the **same way: down**, towards the horizon. That follows from where you are standing. You are on the surface, displaced from the earth\'s centre towards the point directly overhead — so everything you look at appears pushed away from overhead, which means pushed down.',
        'Both of the corrections that follow are that one fact, split in two. Down, along the sun\'s road, means **closer to the sun**: so the gap always gets *smaller*, never larger. Down, across the road, always works out **southward**: so the height moves south whichever side it started on — less north if it was north, more south if it was south.',
        'Which means the standing-on-the-ground shift always works **against** you. It shrinks the gap and pushes the moon to the unhelpful verge, both of which make the crescent harder to catch. The moon seen from the earth\'s centre would always be an easier moon than the one you actually get.',
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
        'The first correction takes minutes off the gap, and **how many depends on the sign the moon is in**: 59 minutes in Taleh, a full degree in Shor, 58 in Teomim, down to 34 in Moznayim and back up again. Twelve signs, twelve numbers. The result is the gap after one adjustment — the *second longitude*.',
        'The second does the same to the height, with its own set of twelve — 9 minutes in Taleh, 10 in Shor, up to 46 in Moznayim. And here the direction matters: if the moon is north of the sun\'s road you take the correction off, if south you add it on. That gives the height after its one adjustment — the *second latitude*.',
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
        '**Take a slice of the adjusted height.** A fraction — two fifths, a third, a quarter, depending again on where the moon sits. The Rambam calls the result the *circuit of the moon*; call it **the slice**.',
        '**Apply the slice to the gap.** North, subtract; south, add — and reversed if the moon is in the other half of the sky. Two adjustments down: the *third longitude*.',
        '**Stretch or shrink it.** Depending on which sign the gap now falls in, add a sixth, or a fifth, or nothing, or subtract a fifth. Three down: the *fourth longitude*. This one is about how steeply that part of the belt sets — the same underlying fact as the early-exit halves, applied more finely.',
        'Then, finally, go back to the **original** height — the one you were told to keep at hand, before any adjustment — take a fraction of it, and apply that to the gap.',
        'What comes out is **the final figure** — the *arc of sighting*, קשת הראייה. The verdict depends on it and nothing else.',
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
        'The rule is a sliding trade between the final figure and the original gap. A large final figure can carry a small gap, and a large gap can carry a small final figure. If the final figure is between 11 and 12 degrees the gap must reach 11; if it is between 13 and 14 the gap need only reach 9. The bigger one gets, the less is asked of the other.',
        'For his worked evening the arc comes to **11 degrees and 11 minutes** and the first longitude to **11 degrees and 27 minutes** — so the moon would have been seen.',
        'A note on the text here, because you may notice something odd if you read the English. The translation at 17:22 says the longitude was *ten* degrees 27 minutes, and then concludes it is "greater than **eleven**" — which ten is not.',
        'The Hebrew has the two figures the other way round. It says the longitude was **11° 27′** and that this is "more than **ten**". Both of those are true, and together they settle the case: the rule for a final figure between 11 and 12 asks for a gap of at least 11, and 11° 27′ clears it.',
        'So the Hebrew is sound and the answer is right; it is the two numbers that have been transposed somewhere between the Hebrew and the English. What makes the slip easy — and hard to spot — is that **both** figures are real and differ only in the tens digit: 11° 27′ is the gap, and 10° 27′ is that same gap after its first adjustment, which he computed a few lines earlier at 17:13.',
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
