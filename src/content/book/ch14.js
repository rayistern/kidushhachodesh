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
        'The first gives about **27 days and 8 hours** — one full lap of the big circle, all the way round the sky and back to the same point of it.',
        'The second gives about **27 days and 13 hours** — one full lap of the small circle, back to the same point of *that*.',
        'Those are genuinely different lengths of time, and that is the whole reason two numbers are needed. Two questions, two answers, two speeds.',
        'Because the small circle does not go round the earth, it has a near point and a far point — so that second lap is also a lap of **near and far**. That follows from his model rather than from anything he says; he never mentions the moon\'s distance here.',
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
        'That is a definition rather than a claim. **The twelve signs are anchored to the seasons, not to the stars:** the circle starts where the sun stands at the spring equinox, so 90 degrees round is midsummer, 180 the autumn equinox, 270 midwinter. The sun\'s longitude and the date are one fact written two ways — which means the season costs him nothing, since chapters 12 and 13 already computed the sun\'s place.',
        'And his circle really is anchored that way. His sun reaches **0°** on 21 March 2026 against a real equinox on the 20th, **90°** on 22 June against a solstice on the 21st, **180°** on 23 September against the 22nd, and **270°** on 22 December against the 21st — every one within a day, eight and a half centuries on.',
        'That is a real test rather than a tautology, because the circle could have been anchored the other way: to a fixed **star** instead of to the equinox. The two slip apart by about a degree every seventy years, so over the span since he wrote they would now disagree by some twelve degrees — nearly a whole sign. His figures follow the seasons, not the stars. The same slip is why the star signs no longer match the constellations they were named for.',
        'He uses the same identity in the other direction at 13:11 — once you can find the sun\'s place on any date, you can work back to the date of any equinox or solstice.',
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
        'If the answer he wants is the moon\'s place *at sunset*, and he never works out what time sunset is — and he does not; there is no sunset calculation anywhere in the nineteen chapters — how can any of it work?',
        'Because he needs the geometry, not the time. **Sunset is not really a time. It is a position:** the moment the sun stands on the horizon. That is as true at 4:39 in December as at 7:48 in June.',
        'And every quantity in chapter 17 is measured **from the sun** — how far the moon has pulled away from it, how high it sits off its road, the arc between them. None from the horizon, none from the ground. So knowing where the moon is relative to the sun, and knowing the sun is on the horizon, is the whole picture. The hour drops out.',
        'That leaves one problem, and it is the one this chapter solves. The moon **moves**, and his tables give positions at a fixed evening hour rather than at sunset. Real sunset wanders about an hour either side of that across the year, and the moon covers roughly half a degree an hour — far too much to ignore. The season correction closes that gap, using the season he reads straight off the sun.',
        'Which is the shape of the whole method: he never asks what time anything happens, only where things stand relative to each other.',
        'One caveat. That the season correction is a *sunset* correction is this book\'s reading. He states the table and gives no reason for it. The fit is good — it peaks at the solstices, where sunset is most extreme, and moves in the right direction — but hold it as a good explanation rather than his own.',
      ],
    },

    {
      id: 'the-table',
      heading: 'The correction table itself',
      source: 'KH 14:5',
      nodeId: 'season',
      body: [
        'The table is short. Find where the sun is, read off the adjustment, and add it to or subtract it from the moon\'s average.',
        'The nudge is at its largest twice a year, half a degree either way, and vanishes near the equinoxes — which is what you would expect of something tracking how far sunset has drifted from a fixed hour.',
        'A note on the text. For the sun between the start of the 3rd sign and the start of the 5th, the witnesses differ: the standard printed editions read a quarter of a degree where the Yemenite manuscripts read half. This book follows the Yemenite reading, as given in the **Chitrik edition** — which also makes the table symmetric, half a degree either way at the two solstices.',
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
