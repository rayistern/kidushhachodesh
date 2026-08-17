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

  terms: [
    {
      plain: 'where the arm is pointing',
      formal: "the moon's mean",
      hebrew: 'אמצע הירח',
      gloss:
        'Where the **small circle itself** has got to as it travels round the big one. Think of the arm of a fairground ride, and this is where the arm points.',
    },
    {
      plain: 'where you sit in the cup',
      formal: 'the mean within its path',
      hebrew: 'אמצע המסלול',
      gloss:
        'Where the **moon** has got to around the edge of the small circle. Same ride, the other question.',
    },
    {
      plain: 'average place',
      formal: 'mean position',
      hebrew: 'אמצע',
      gloss:
        'Where something would be if it never changed speed. Easy to work out, and never quite where you see it. *Emtza* just means "middle".',
    },
    {
      plain: 'the sunset nudge',
      formal: 'the season correction',
      hebrew: null,
      gloss:
        'A small adjustment of up to half a degree, added or taken off so the answer lands at the moment someone is actually outside looking — about twenty minutes after sunset.',
    },
  ],

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
        '**Where the arm is pointing** — how far the *small circle itself* has got round the big one. His name for it is the **moon\'s mean**, אמצע הירח.',
        '**Where you sit in the cup** — how far the *moon* has got round the edge of the small circle. His name for it is the **mean within its path**, אמצע המסלול.',
        'Neither number alone tells you where the moon is. You need both, and chapter 15 is where they finally get put together. This chapter\'s job is just to work each of them out.',
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
        'Now the part that causes the most confusion. Both of those things move, and they move at almost — but not quite — the same speed:',
        '**13° 10\' 35" a day** — for the arm: the small circle going round the big one. (14:1)',
        '**13° 3\' 54" a day** — for the cup: the moon going round the small circle. (14:3)',
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
        'This part you already know how to do, because it is exactly what chapter 12 did for the sun — the same adding-up, with the moon\'s tables instead.',
        'Count the days from the starting point. Break that number into the Rambam\'s ready-made chunks — ten days, a hundred days, a thousand, ten thousand. Look up how far the moon travels in each chunk, add them all together, throw away whole circles, and add the position it started from.',
        'Where the arm pointed at the starting point was **1° 14\' 43" into the 2nd sign** (Shor) (14:4). Where the moon sat in the cup was **84° 28\' 42"**.',
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
        'Having got the moon\'s average place, the Rambam says (14:5) to adjust it — by nothing, or by 15 minutes of arc, or by 30 — and *which* adjustment depends on **where the sun is**.',
        'That looks absurd at first. The sun does not push the moon about. So why should the sun\'s position change the moon\'s answer?',
        'The answer is in the very next line (14:6). The number he wants is not "where the moon is" in the abstract. It is where the moon is **about twenty minutes after sunset** — because that is when someone would be outside looking for it. So call this adjustment what it is: **the sunset nudge**.',
        'And sunset is not at a fixed time. It slides through the year: late on summer evenings, early in winter. So "twenty minutes after sunset" is a different hour of the clock depending on the season. The moon moves about half a degree an hour, so a different hour means a different position.',
        'Where the sun sits in the zodiac *is* the season. So keying the correction to the sun\'s position is simply keying it to the time of year — which is keying it to how late sunset is. It is not astrology and it is not the sun tugging on the moon. It is a clock correction.',
        'That last step deserves unpacking, because "the sun\'s position is the season" sounds like a claim needing proof and is actually a definition. **The twelve signs are anchored to the seasons themselves, not to the stars.** The circle starts where the sun stands at the spring equinox. So a quarter of the way round, at 90 degrees, is midsummer; halfway, at 180, is the autumn equinox; three quarters, at 270, is midwinter. The sun\'s longitude and the date in the year are not two facts to be converted between — they are **one fact written two ways**.',
        'Which means he gets the season for nothing. He has already computed the sun\'s position, back in chapters 12 and 13, for its own reasons. Reading the season off it costs no extra work at all, and requires no calendar, no almanac, and no clock.',
        'You can check that this is really how his circle is anchored, and it is a satisfying check because it could easily come out otherwise. Ask his method for the day his true sun reaches each quarter-point of the circle, and compare against the actual seasons:',
        'His sun reaches **0°** on 21 March 2026, against a real equinox on the 20th. It reaches **90°** on 22 June, against a solstice on the 21st. **180°** on 23 September, against the equinox on the 22nd. And **270°** on 22 December, against the solstice on the 21st.',
        'Every one within a day, eight and a half centuries after he wrote. A circle anchored to the stars instead would have slipped about twelve degrees by now — nearly two weeks adrift — so this is a real test, and his frame passes it.',
        'He says as much himself at the end of the previous chapter (13:11): once you can find the sun\'s place on any date, you can work backwards and find the date of any equinox or solstice you like. The season and the sun\'s position are the same information, and he uses that identity in both directions.',
        'The diagram below plots sunset across the year against the correction he asks for. They rise and fall together.',
      ],
      interactive: 'sunset-season',
    },

    {
      id: 'no-clock',
      heading: 'How he manages without ever knowing what time sunset is',
      source: 'KH 14:6',
      nodeId: 'season',
      body: [
        'A fair objection to everything just said. If the answer he wants is the moon\'s place *at sunset*, and he never works out what time sunset is — and he does not, there is no sunset calculation anywhere in the nineteen chapters — then how can any of this work?',
        'The answer is that he does not need the time. He needs the **geometry**, and those are different things.',
        '**Sunset is not really a time. It is a position.** It is the moment the sun stands on the horizon. That is a statement about where things are, not about a clock, and it is true at 4:39 in December and 7:48 in June without changing in the slightest.',
        'Now look at what chapter 17 actually asks for. Every quantity in it is measured **from the sun**: how far the moon has pulled away from the sun, how high it sits off the sun\'s road, how much of an arc separates them. Not one of them is measured from the horizon, or from the ground, or from anything that needs a clock.',
        'So put those together. If you know where the moon is *relative to the sun*, and you know the sun is on the horizon, you already have the entire picture — how far from the sun the moon stands and how high above the ground it hangs. **The hour drops out of the arithmetic completely.** He works in the sun\'s frame of reference, and a clock is simply not one of the things that frame contains.',
        'Which leaves exactly one problem, and it is the one this chapter solves. The moon **moves**. To know where it stands relative to the sun at that geometric moment, you need its position *then* — and his tables give positions at a fixed evening hour, not at sunset. Across the year real sunset wanders from that fixed hour by about an hour either way, and the moon covers roughly half a degree an hour. That is over half a degree of error, which is far too much to ignore.',
        'So the whole of the season correction exists to close a gap that opens only because his tables had to be anchored to *something*. And he closes it without a clock, using the season — which, as above, he reads straight off the sun. **A timing problem, converted into arcminutes of moon travel, solved with a number he already had.**',
        'That is worth sitting with, because it explains the shape of the entire method. He never asks what time anything happens. He only ever asks where things are relative to each other. It is why the same calculation serves a reader anywhere in the band he names, and why nineteen chapters of astronomy contain no clock at all.',
        'One honest caveat, which the book owes you. That the season correction is a *sunset* correction is this book\'s reading. The Rambam states the table and gives no reason for it. The reading fits well — the correction peaks at the solstices, exactly where sunset is most extreme, and it moves in the right direction — but he does not say so, and you should hold it as a good explanation rather than his own.',
      ],
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
