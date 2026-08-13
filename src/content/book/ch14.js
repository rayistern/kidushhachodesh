/**
 * Chapter 14 of the plain-language book — the moon's average position.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * Written for a reader with no background in astronomy or mathematics.
 * Every technical word is either avoided or defined at the point it is
 * first used. Where a number appears in this prose it is pinned against
 * the engine in ch14.test.js, so the writing cannot quietly drift away
 * from what the calculators compute.
 *
 * The chapter is built around the three things that make KH 14 hard:
 *
 *   1. Two "means" whose numbers look nearly identical (13°10'35" and
 *      13°3'54") but which measure different things. Section 3-4.
 *   2. The season correction of KH 14:5, which keys off the *sun's*
 *      position for no reason the text gives. Section 6-7.
 *   3. The answer being a position at a *moment* — twenty minutes after
 *      sunset — rather than a position simply. Sections 6 and 8.
 *
 * `interactive` values are slot ids resolved by
 * src/components/book/interactives/index.js.
 */

export default {
  chapter: 14,
  sourceChapter: 14,
  title: 'Where the moon is, on average',
  hebrewTitle: 'אמצע הירח',
  subtitle: "The moon's turn. Two speeds, one strange correction, and an answer that is tied to a particular moment of a particular evening.",

  recap: {
    settled: [
      "A day count from the Rambam's starting point to any evening you like.",
      "The sun's **average** place — where it would be at a perfectly steady speed.",
      "The sun's **true** place, corrected with the table in chapter 13.",
    ],
    thisChapter:
      'The sun was the easy half. This chapter starts the moon, and it starts the same way chapter 12 did: with the *average* position, before any corrections.',
    byTheEnd:
      "You will be able to say where the moon is on average on any evening you choose — and you'll understand why that answer needs a nudge that depends on the time of year.",
  },

  sections: [
    {
      id: 'why-harder',
      heading: 'Why the moon is harder than the sun',
      source: 'KH 14:1',
      nodeId: 'moon-mean',
      body: [
        'With the sun, there was one circle and one speed. The sun rides around a circle, always at the same pace, and the only complication was that we are not standing at the centre of that circle — so it *looks* like it speeds up and slows down.',
        'The moon has that problem too. But it has a second one on top: **the moon does not simply go round us.** It goes round a point, and that point goes round us.',
        'Picture a fairground ride. There is a big arm that sweeps around the centre, and at the end of that arm is a small spinning cup with you in it. Where are you? To answer, someone needs to know two things: where the arm is pointing, and where you are within the cup. One number cannot tell them.',
        'That is exactly the shape of the Rambam\'s moon. And it is why this chapter gives you **two** speeds instead of one — a fact that trips up nearly everybody, because the two numbers look almost the same.',
      ],
    },

    {
      id: 'small-circle',
      heading: 'The small circle riding on the big one',
      source: 'KH 14:1',
      nodeId: 'moon-mean',
      body: [
        'Here is how the Rambam opens the chapter (14:1): the moon "revolves in a small orbit that does not encompass the earth", and that small orbit "itself rotates in a larger orbit that encompasses the earth".',
        'So there are two things moving, and each gets its own name:',
        '**The moon\'s mean** (אמצע הירח) — where the *small circle itself* has got to, as it travels around the big circle. Think of it as where the arm of the ride is pointing.',
        '**The mean within its path** (אמצע המסלול) — where the *moon* has got to around the edge of the small circle. Where you are inside the cup.',
        'Neither one alone tells you where the moon is. You need both, and chapter 15 is where they finally get combined. This chapter\'s job is just to work out each of them.',
        'Drag the slider below and watch the two move. Notice that the moon\'s actual position wanders in and out relative to the big circle — that wandering is the whole reason a second number is needed.',
      ],
      interactive: 'epicycle',
    },

    {
      id: 'two-speeds',
      heading: 'Two speeds that look almost the same',
      source: 'KH 14:3',
      nodeId: 'moon-anomaly',
      body: [
        'Now the part that causes the most confusion. The two speeds are:',
        '**13° 10\' 35" a day** — for the moon\'s mean, the small circle going round the big one. (14:1)',
        '**13° 3\' 54" a day** — for the mean within its path, the moon going round the small circle. (14:3)',
        'They differ by about **6 and a half minutes of arc a day** — a difference so small that it is genuinely easy to write one down when you meant the other. But they are answers to two completely different questions, and the difference is not an error or a rounding. It is the point.',
        'Here is what makes them click. Take each speed and ask: *how long until it completes a full circle?*',
        'The first gives about **27 days and 8 hours** — that is how long the moon takes to go once around the sky and return to the same star.',
        'The second gives about **27 days and 13 hours** — that is how long from the moon\'s closest approach to us until its next closest approach.',
        'Those are genuinely different lengths of time, because the moon\'s orbit is not a circle with us at the middle, and the whole orbit slowly turns. So "once round the sky" and "one lap of near-and-far" do not finish together. Two questions, two answers, two speeds.',
        'And if you want to know how good the Rambam\'s numbers are: compare them with what modern astronomy measures. The calculator does it for you.',
      ],
      interactive: 'two-speeds',
    },

    {
      id: 'calculating',
      heading: "Working out the moon's average on a given day",
      source: 'KH 14:4',
      nodeId: 'moon-mean',
      body: [
        'This part you already know how to do, because it is exactly what chapter 12 did for the sun.',
        'Count the days from the starting point. Break that number into the Rambam\'s ready-made chunks — ten days, a hundred days, a thousand, ten thousand. Look up how far the moon travels in each chunk, add them all together, throw away whole circles, and add the position it started from.',
        'The moon\'s starting position, at the epoch, was **1° 14\' 43" in Shor (Taurus)** (14:4). Its mean within the path started at **84° 28\' 42"**.',
        'The only thing different from the sun is that the numbers are bigger, because the moon moves about thirteen times faster.',
      ],
      interactive: 'moon-mean',
    },

    {
      id: 'why-sun',
      heading: "Why the sun's position changes the moon's answer",
      source: 'KH 14:6',
      nodeId: 'season',
      body: [
        'Now the strangest thing in the chapter, and the place where most people stop and stare.',
        'Having got the moon\'s average position, the Rambam says (14:5) to adjust it — by nothing, or by 15 minutes of arc, or by 30 — and *which* adjustment depends on **where the sun is**.',
        'That looks absurd at first. The sun does not push the moon about. So why should the sun\'s position change the moon\'s answer?',
        'The answer is in the very next line (14:6). The number he wants is not "where the moon is" in the abstract. It is where the moon is **about twenty minutes after sunset** — because that is when someone would be outside looking for it.',
        'And sunset is not at a fixed time. It slides through the year: late on summer evenings, early in winter. So "twenty minutes after sunset" is a different hour of the clock depending on the season. The moon moves about half a degree an hour, so a different hour means a different position.',
        'Where the sun sits in the zodiac *is* the season. So keying the correction to the sun\'s position is simply keying it to the time of year — which is keying it to how late sunset is. It is not astrology and it is not the sun tugging on the moon. It is a clock correction.',
        'The diagram below plots sunset across the year against the correction he asks for. They rise and fall together.',
      ],
      interactive: 'sunset-season',
    },

    {
      id: 'the-table',
      heading: 'The correction table itself',
      source: 'KH 14:5',
      nodeId: 'season',
      body: [
        'The table is short. Find where the sun is, read off the adjustment, and add it to or subtract it from the moon\'s average.',
        'One thing to know before you use it: **the printed texts disagree about one row of this table**, and the disagreement is not settled. The calculator below shows you both readings and what the choice costs. It is worth knowing about rather than discovering later as a contradiction.',
      ],
      interactive: 'season-table',
    },
  ],

  closing: {
    have: [
      "The moon's average position on any evening — its mean.",
      'The mean within its path, which says where the moon sits on the small circle.',
      "Both nudged to the moment of sighting, twenty minutes after sunset.",
    ],
    missing: [
      'Where the moon **really** is. Everything so far is an average, and averages are not what you see — the same problem chapter 13 solved for the sun. Chapter 15 solves it for the moon, and it takes the two numbers you just worked out and finally puts them together.',
    ],
  },
};
