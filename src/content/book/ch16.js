/**
 * Chapter 16 of the plain-language book — the moon's height off the track.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The chapter that undoes an assumption every earlier chapter quietly
 * made: that the sky is one line and everything slides along it.
 *
 * Three things need saying that the text leaves implicit:
 *
 *   1. Why this chapter exists at all — nothing before it hinted that
 *      the moon leaves the sun's track. Section 1.
 *   2. That the head moves BACKWARDS, which is why KH 16:3's rule is to
 *      subtract from 360 rather than simply use the total. That
 *      instruction is baffling until you know the direction. Section 3.
 *   3. That the folding rules here are four-way, not the two-way mirror
 *      of chapters 13 and 15 — a reader who has learned the earlier
 *      pattern will apply it here and be wrong. Section 5.
 */

export default {
  chapter: 16,
  sourceChapter: 16,
  title: "How far off the sun's track the moon is",
  hebrewTitle: 'רוחב הירח',
  subtitle:
    'Everything so far pretended the sky was a single line. It is not — and the moon wanders up to five degrees off it, which is exactly enough to decide whether you can see it.',

  terms: [
    {
      plain: 'height off the line',
      formal: 'latitude',
      hebrew: 'רוחב',
      gloss:
        "How far above or below the sun's track the moon sits. Never more than five degrees either way. Nothing to do with latitude on a map — it is a height in the sky.",
    },
    {
      plain: 'the up-crossing',
      formal: 'the head',
      hebrew: 'ראש',
      gloss:
        "The point where the moon crosses the sun's track on its way **up**. From here it climbs above the line.",
    },
    {
      plain: 'the down-crossing',
      formal: 'the tail',
      hebrew: 'זנב',
      gloss:
        "Directly opposite, half a circle away. The point where the moon crosses back **down** below the line.",
    },
    {
      plain: 'how far past the up-crossing',
      formal: 'the course of the latitude',
      hebrew: 'מסלול הרוחב',
      gloss:
        'The one number this chapter looks everything up by: how far round the moon has travelled since the up-crossing.',
    },
    {
      plain: 'above the line / below the line',
      formal: 'northerly / southerly',
      hebrew: 'צפוני / דרומי',
      gloss:
        "Which side of the sun's track the moon is on. Above is the helpful side — it lifts the moon higher at sunset.",
    },
  ],

  recap: {
    settled: [
      "The sun's true position on any evening.",
      "The moon's true position on the same evening.",
      'Which is to say: where both bodies are, measured round the circle of the signs.',
    ],
    thisChapter:
      "Every position so far has been a single number — how far round the circle. That quietly assumed the sun and moon travel the same track. They do not. This chapter measures how far the moon sits above or below the sun's path.",
    byTheEnd:
      'You will be able to say not just where the moon is, but how high it sits off the sun\'s track and on which side — the last piece before the visibility question itself.',
  },

  sections: [
    {
      id: 'not-a-line',
      heading: 'The sky is not a single line',
      source: 'KH 16:1',
      nodeId: 'latitude',
      body: [
        'Everything up to now has treated the sky as a circle with the sun and moon sliding round it. One number each, and you know where they are.',
        'That was a convenient half-truth. The sun really does keep to one track — the belt of the signs is *defined* by the sun\'s path. But the moon\'s own circle is **tilted** against it. So the moon spends most of its time a little above the sun\'s track or a little below, and only crosses it twice a month.',
        'The Rambam calls that height the **latitude** — the *rochav* (רוחב), literally "width". A plainer name for it, and the one this chapter will mostly use, is simply **the moon\'s height off the line**. It never gets larger than **five degrees** either way.',
        'Five degrees does not sound like much. It is about ten times the width of the moon itself, and on the night in question it is the difference between a crescent sitting clear of the horizon glow and one lost in it. That is why the chapter is here.',
      ],
      interactive: 'moon-tilt',
    },

    {
      id: 'head-and-tail',
      heading: 'The two places the circles cross',
      source: 'KH 16:1',
      nodeId: 'latitude',
      body: [
        'Two tilted circles that share a centre cross at exactly two points, opposite each other. Those two points are the whole of this chapter\'s machinery.',
        'The Rambam names them for what the moon does there. At one, the moon is crossing from below the sun\'s track to above it — he calls that the **head** (ראש); think of it as **the up-crossing**. Half a circle away it crosses back down: the **tail** (זנב), or **the down-crossing**.',
        'At either crossing the moon sits exactly on the sun\'s track and has no height at all. Between them it climbs to five degrees and comes back down. So if you know where the up-crossing is, and where the moon is, you know how high it must be — which is the calculation the rest of the chapter performs.',
        'And because the two are always half a circle apart, knowing one gives you the other for free. Seven signs along, at the same degree.',
      ],
    },

    {
      id: 'backwards',
      heading: 'The head walks backwards',
      source: 'KH 16:2-3',
      nodeId: 'latitude',
      body: [
        'Here is the fact that makes this chapter\'s instructions look strange, and the one the text states almost in passing.',
        'The up-crossing does not stay put, and it does not travel the way everything else does. It moves **against** the order of the signs — the Rambam says it goes "from Dagim to D\'li", which is backwards through the list. Everything else in the book counts forwards.',
        'It is also extremely slow: **3 minutes and 11 seconds of arc a day**, which works out to a full lap in a little over eighteen and a half years.',
        'That backwards march is why KH 16:3 gives an instruction that otherwise makes no sense. You work out its progress exactly as you did the sun\'s and the moon\'s — count the days, add up the chunks, add the starting figure — and then you **subtract the whole thing from 360**. Everything else you calculate, you use as it stands. This one you flip.',
        'The flip is simply what "backwards" means in arithmetic. Your running total counts how far the up-crossing has gone; because it goes the other way, that distance has to be taken off a full circle to give a position.',
      ],
      interactive: 'node-march',
    },

    {
      id: 'which-side',
      heading: 'North or south?',
      source: 'KH 16:10',
      nodeId: 'latitude',
      body: [
        'Now the calculation, and it is the same shape you have done twice already: find a course, look it up in a table.',
        'The course here is the moon\'s true position less the up-crossing\'s position. He calls it the **course of the latitude**; in plain words it is just **how far past the up-crossing the moon has got**.',
        'Which side it is on falls straight out of that one number. Under 180 degrees and the moon is still in the half of its circle **above** the line — the text says *northerly*. Over 180 and it is in the half **below** — *southerly*. Exactly 180 or 360, and it is sitting on a crossing with no height at all.',
      ],
    },

    {
      id: 'the-table',
      heading: 'The table — and a folding rule that has changed',
      source: 'KH 16:11',
      nodeId: 'latitude',
      body: [
        'The table runs only to ninety degrees, where the latitude reaches its full five. Ten degrees gives 52 minutes, thirty gives 2 degrees 30, sixty gives 4 degrees 20, ninety gives the full five.',
        'Between rows you share out the difference exactly as before. He works 53 degrees: between 50 and 60 the answer moves 30 minutes across ten degrees, so 3 minutes a degree, so 53 gives 3 degrees 59.',
        '**But the folding rule is not the one you learned.** In chapters 13 and 15 anything past 180 was mirrored by subtracting from 360, and that was the whole story. Here the circle folds in *four*:',
        'Between 90 and 180 — take the course **from 180**. Between 180 and 270 — take **180 from the course**. Between 270 and 360 — take the course **from 360**.',
        'The reason is that height behaves differently from the corrections you have met. Those rose once and fell once across the circle. Height rises and falls **twice** — up to five above, back to nothing at the down-crossing, down to five below, back to nothing at the up-crossing. Two humps need two folds each.',
      ],
      interactive: 'latitude-table',
    },

    {
      id: 'worked',
      heading: 'The same evening again',
      source: 'KH 16:19',
      nodeId: 'latitude',
      body: [
        'He closes by doing it for the evening he has been working all along — the second of Iyar, twenty-nine days from the start.',
        'The moon\'s true position he already has from chapter 15. The up-crossing he works out here. Subtract one from the other to get how far past it the moon has come, drop the minutes, fold that into the table, and read off the height.',
        'His answer: **3 degrees and 53 minutes, southerly**. The moon that evening sat nearly four degrees *below* the sun\'s track.',
        'Which is not good news for seeing it. Below the line means lower in the sky at sunset than it would otherwise have been, and lower means deeper in the glare. Chapter 17 is where that finally gets weighed.',
      ],
      interactive: 'moon-latitude',
    },
  ],

  closing: {
    have: [
      "The moon's true position, and now its **height** off the sun's track — up to five degrees, north or south.",
      'The position of the up-crossing and down-crossing (head and tail) on any date, remembering that they run backwards.',
      'Which means every quantity the visibility test needs.',
    ],
    missing: [
      'The answer. You now have where the sun is, where the moon is, and how high the moon sits — three numbers, and no verdict. Chapter 17 is the one that turns them into a single figure and says whether anybody could have seen it. It is the longest chapter in the book, and everything so far has been preparing its inputs.',
    ],
  },
};
