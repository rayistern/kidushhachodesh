/**
 * Chapter 18 of the plain-language book — what the calculation cannot do.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * A different kind of chapter, and the book should say so. Eleven to
 * seventeen build a machine; eighteen is the Rambam turning round and
 * telling you what the machine's answer is worth.
 *
 * Three movements, and the reader should be able to feel the shift:
 *
 *   1. The answer is "probable", not "certain" (18:1-3). Cloud, dust,
 *      terrain and altitude all sit outside the arithmetic.
 *   2. So the court cross-examines differently depending on how close
 *      the answer was to the line (18:4). This is a *legal* use of a
 *      confidence level, written in the twelfth century.
 *   3. And when the moon goes unseen for months, the calendar cannot
 *      simply drift — a tradition supplies the alternation (18:5-11).
 *
 * The east-west reasoning of 18:13-16 is included because it is a
 * genuine piece of logic with asymmetric implications, and because he
 * ends it by saying plainly that it is of no practical consequence —
 * which is a striking thing to say after working it out.
 *
 * No new engine work here: the figures reuse the KH 17 verdict machinery
 * to show *how close to the line* a night falls, which is exactly what
 * this chapter is about.
 */

export default {
  chapter: 18,
  sourceChapter: 18,
  title: 'What the calculation cannot tell you',
  hebrewTitle: 'תנאי הראייה',
  subtitle:
    'Seven chapters of arithmetic, and then the Rambam turns round and says: this gives you probable, not certain. Here is how a court should handle that.',

  terms: [
    {
      plain: 'how close to the line it fell',
      formal: 'the margin past the sighting limits',
      hebrew: null,
      gloss:
        'Not a term of his — a way of naming what KH 18:3 describes. A verdict of "visible" that only just cleared the thresholds means a thin crescent; one that cleared them by degrees means an obvious moon.',
    },
    {
      plain: 'fixing a month without sanctifying it',
      formal: 'kove\'in without kidush',
      hebrew: 'קובעין ולא מקדשין',
      gloss:
        'The distinction the whole middle of this chapter turns on. When sighting fails, the court may **fix** a month by calculation — but only an actual sighting **sanctifies** it.',
    },
    {
      plain: 'a full month / a short month',
      formal: 'male / chaser',
      hebrew: 'מלא / חסר',
      gloss:
        'Thirty days and twenty-nine days. When the moon goes unseen for months the court alternates them, never fewer than four full months in a year and never more than eight.',
    },
  ],

  recap: {
    settled: [
      'The complete method — a date in, and a yes or a no out.',
      'The arc of sighting, and the two thresholds that usually settle a night outright.',
      'The trade between the arc and the gap, for the nights that fall between.',
    ],
    thisChapter:
      'Everything so far produced an answer. This chapter asks a harder question: **how much should anyone believe it?** The Rambam\'s reply is unusually frank, and it changes how the answer is meant to be used.',
    byTheEnd:
      'You will know what sits outside the calculation, why a court would treat two identical verdicts very differently, and what happened when the moon simply refused to be seen for months on end.',
  },

  sections: [
    {
      id: 'probable',
      heading: 'The answer is "probably", not "certainly"',
      source: 'KH 18:1',
      nodeId: 'limits',
      body: [
        'The chapter opens by conceding something that seven chapters of careful arithmetic might have made you forget.',
        'Even when the calculation says the moon *will* be seen, it may not be — because cloud covers it, or the watchers stand in a valley, or a mountain blocks the west. And the reverse holds too: someone high on a mountain, or out at sea, may catch a crescent that the calculation calls marginal.',
        'None of that is in the numbers. Altitude, terrain, the weather that night — the method has no way to reach them, and the Rambam does not pretend otherwise.',
        'He adds one more that is easy to miss and rather lovely. The air itself matters: on a clear day in the rainy season the sky is sharper, because the summer air is "like smoke, because of the dust". A winter crescent is easier to catch than a summer one of the same size.',
      ],
    },

    {
      id: 'how-close',
      heading: 'How close to the line the night fell',
      source: 'KH 18:3',
      nodeId: 'limits',
      body: [
        'Here is the idea that turns the previous section into something usable.',
        'A verdict of "visible" is not one thing. If the arc of sighting and the gap only just cleared their thresholds, the crescent is thin and only a watcher high up will catch it. If they cleared them by several degrees, the moon is obvious and half the country will see it.',
        '**The size of the crescent and the ease of seeing it grow with how far past the minimum you are.** So the same yes can mean "look very carefully from a hilltop" or "you could hardly miss it".',
        'That is a confidence level, in a system that had no vocabulary for one. And the next halacha turns it into a rule of court procedure.',
      ],
      interactive: 'how-marginal',
    },

    {
      id: 'cross-examine',
      heading: 'Why the court asked witnesses where they were standing',
      source: 'KH 18:4',
      nodeId: 'limits',
      body: [
        'The court, says the Rambam, should always keep two things in mind: **the season, and the place the witnesses were standing**. And it should ask them outright: where were you when you saw it?',
        'He gives the case. Suppose the arc of sighting came to 9 degrees 5 minutes and the gap to exactly 13 degrees. By the rules of chapter 17 that is a yes — but only just; it is the narrowest passing verdict the table allows. Witnesses arrive saying they saw it.',
        'If it is summer, or they were standing somewhere low, **suspect the testimony and cross-examine hard**. If it is the rainy season, or they were high up, the claim is entirely believable and can be accepted.',
        'Nothing about the astronomy has changed between those two cases. What changed is how much weight a marginal calculation can bear — and the court adjusts how hard it questions to match. The arithmetic does not overrule the witnesses; it tells the judges how carefully to listen.',
      ],
    },

    {
      id: 'months',
      heading: 'When the moon simply would not be seen',
      source: 'KH 18:5',
      nodeId: 'limits',
      body: [
        'Then a genuine problem, which the Rambam sets out at length because the obvious answer fails.',
        'A month is sanctified when the moon is seen. If it is not seen on the thirtieth night, the month gets a thirty-first day. Fine once. But suppose the moon goes unseen month after month — a long cloudy winter will do it — and every month gains a day. By the end of the year the calendar has drifted so far that the moon would be plainly visible on the twenty-fifth of the month. He calls the prospect laughable and an embarrassment, and he is right.',
        'And he refuses to dismiss it as unlikely. On the contrary, he says, **it is very likely**, and common in countries with long rainy seasons.',
        'The answer is a tradition, carried back to Moses: when sighting fails repeatedly, the court establishes months by alternating — one full month of thirty days, one short of twenty-nine — **establishing** them without **sanctifying** them, since sanctification depends on sighting alone. Two full or two short in a row where the calculation calls for it. Never fewer than four full months in a year, never more than eight.',
        'What the calculation is for, in that situation, is a guard rail: it tells the court which arrangement keeps the moon visible at the *start* of the coming month rather than on its twenty-eighth night.',
      ],
    },

    {
      id: 'tonight-here',
      heading: 'Using it for real, from where you live',
      source: 'KH 18:4',
      nodeId: 'limits',
      body: [
        'Everything so far has been about reading his method. This section is about going outside.',
        '**His verdict takes no location at all.** KH 11:17 fixes one reference for everybody within six or seven days\' journey of Jerusalem, which he puts at about 32 degrees north, and that is the only geography the calculation has. The answer is the same in Jerusalem, in Karmiel, and anywhere else in that band.',
        'What his method cannot give you is **a time on a clock**. KH 14:6 asks for the moon\'s position about a third of an hour after sunset, and sunset depends on how far north you are, how far east, and how high you stand. Nothing in these nineteen chapters computes a sunset — the instruction is his, the sunset time on the card is modern, and so are the timezone and the daylight-saving rule. The card works his moment out at his own reference first, then shows what to add for where you are.',
        'The sizes are not what you would guess. Moving from Jerusalem to **Karmiel**, a degree further north, shifts sunset by between four and a half minutes earlier and one minute later depending on the season — under two and a half arcminutes of moon travel, which never changes a verdict.',
        'But **standing higher up does matter**, and he is the one who says so. Karmiel sits around 330 metres, and height lets you see past the horizon by roughly half a degree — larger than the entire margin on a borderline night. That is the effect of 18:1: the watcher on the mountain catching what the calculation called marginal. Your altitude is worth more than your latitude here.',
        'The card flags a night that falls **close to the line**, and carries two honest limits: his sun runs a hair fast, tilting marginal nights very slightly toward "visible"; and there is no lunar ephemeris here, so it cannot tell you when the moon sets. It tells you when and where to look.',
      ],
      interactive: 'tonight-here',
    },

    {
      id: 'east-west',
      heading: 'What a sighting somewhere else proves',
      source: 'KH 18:13',
      nodeId: 'limits',
      body: [
        'The chapter closes with a piece of pure reasoning, and it is worth following because the implications run one way only.',
        'The earth turns west, so a place west of the land sees the same evening a little later — by which time the moon has pulled further from the sun and is easier to catch. A place east sees it earlier, when the moon is tighter to the sun and harder.',
        'From that, four statements, of which only two are useful:',
        '**Seen in the land → certainly seen anywhere west of it** at the same latitude. But *not* seen in the land tells you nothing about the west; it may still be seen there.',
        '**Seen anywhere east of the land → certainly seen in the land.** But not seen in the east tells you nothing; it may still be seen here.',
        'So a report from the east can settle the question and a report from the west cannot — and a failure to see it in the west settles it, while a failure in the east does not. Exactly the reverse of what an untrained guess would say.',
        'All of it holds only for places at the land\'s own latitude, roughly 30 to 35 degrees north. Further north or south and the reasoning does not carry.',
      ],
      interactive: 'east-west',
    },

    {
      id: 'why-bother',
      heading: 'And then he says none of it matters',
      source: 'KH 18:16',
      nodeId: 'limits',
      body: [
        'Having worked out the east-west logic, the Rambam adds something startling. It is of no practical consequence whatsoever. People in the east or the west do not rely on their own sighting and never did; the month is set by the court in the land, and nowhere else.',
        'So why work it out? His answer: to clarify all the laws of sighting, **"to make the Torah great and glorious"**.',
        'That is worth sitting with, because it is also the honest description of this chapter and arguably of the whole book. The court has not sanctified a month by sighting for a very long time — 18:12 says as much, that in our era the fixed reckoning is what we use. The astronomy in chapters 11 to 17 has not been operationally necessary for centuries.',
        'He wrote it anyway, in full, with the tables. Understanding the thing is the reason.',
      ],
    },
  ],

  closing: {
    have: [
      'The method, and an honest sense of what its answers are worth.',
      'Why two identical verdicts can deserve very different questioning in court.',
      'What the court did when sighting failed for months together.',
      'What a sighting east or west of the land does and does not prove.',
    ],
    missing: [
      'One chapter. The court did not only ask witnesses *whether* they saw the moon — it asked which way the crescent was tilted and how high it stood, questions with checkable answers. Nineteen shows how to work both out, and it is the last of the astronomy.',
    ],
  },
};
