/**
 * Chapter 6 of the plain-language book — the molad arithmetic.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The first calendar chapter the book covers, and the one chapter 11's
 * day-count seam has pointed at since it was written. The astronomical
 * chapters need a day count; this is where day counts come from.
 *
 * The shape a reader needs: KH 6 is ONE method — an anchor, an
 * interval, and addition — wearing five sets of published shortcuts.
 * Exactly the shape of chapter 12, which is worth saying, because a
 * reader coming from the astronomy will recognise the whole design.
 */

export default {
  chapter: 6,
  sourceChapter: 6,
  title: 'The average new moon, by addition',
  hebrewTitle: 'חשבון המולד',
  subtitle:
    'One anchor moment, one interval, and addition — the arithmetic that runs the calendar to this day.',

  terms: [
    {
      plain: 'the meeting',
      formal: 'the conjunction, the molad',
      hebrew: 'מולד',
      gloss:
        'The moment the moon catches up to the sun and the month starts over. This chapter computes the AVERAGE meeting — steady-speed pretend time, exactly like the average positions of chapters 12 and 14.',
    },
    {
      plain: 'parts',
      formal: 'chalakim',
      hebrew: 'חלקים',
      gloss:
        'The small unit: 1080 parts make an hour, so one part is 3⅓ seconds. Chosen because 1080 divides cleanly by halves, thirds, quarters, fifths, sixths, eighths, ninths and tenths — everything but sevens.',
    },
    {
      plain: 'the leftover',
      formal: 'the remainder',
      hebrew: 'שארית',
      gloss:
        'What is left of a span after whole weeks are thrown away. A month leaves 1 day, 12 hours, 793 parts. Weeks vanish because the only question is WHICH WEEKDAY, and a whole week changes nothing.',
    },
    {
      plain: 'the anchor',
      formal: 'BaHaRaD',
      hebrew: 'בהר"ד',
      gloss:
        'The molad of Tishrei of year 1: Monday (day 2), 5 hours, 204 parts — the letters spell the numbers. Every molad ever computed is this plus whole months.',
    },
  ],

  recap: {
    settled: [
      'Chapters 1-5 (still in the source text): the court sanctified months by witnesses, sent messengers, and added leap years — and when the courts ceased, a fixed calculation took over.',
      'This book began at chapter 11 with a gap behind it. This chapter and the two after it close the most-used part of that gap.',
    ],
    thisChapter:
      'The fixed calendar computes the **average** moment the moon catches the sun — the molad — for any month of any year, using nothing but addition. This chapter is that arithmetic.',
    byTheEnd:
      'You will be able to find the molad of any Tishrei from one anchor and one interval — and you will recognise the whole design, because chapter 12 did the same thing to the sun.',
  },

  sections: [
    {
      id: 'the-units',
      heading: 'Days of 24 hours, hours of 1080 parts',
      source: 'KH 6:2',
      nodeId: 'molad',
      body: [
        'The chapter opens by fixing units. A day is taken as twenty-four hours, and each hour splits into **1080 parts** — so a part is 3⅓ seconds.',
        'Why 1080? Because it divides evenly by 2, 3, 4, 5, 6, 8, 9 and 10 — every small fraction a calculation might want, except sevenths. Base-60 needed two levels (minutes, then seconds) to divide that well; 1080 does it in one.',
        'Hours are counted from the **evening**, since the Hebrew day begins at nightfall. Hour 0 is 6 PM; noon is hour 18. That convention decides a Rosh HaShanah in the next chapter, so it is worth fixing now.',
      ],
    },

    {
      id: 'the-month',
      heading: 'The one interval everything is built from',
      source: 'KH 6:3',
      nodeId: 'molad',
      body: [
        'From one meeting of the moon and sun to the next, at their average speeds, is **29 days, 12 hours, and 793 parts**. That triple is the entire raw material of the fixed calendar.',
        'It is an average, in exactly the sense chapter 11 defined: the real moon speeds up and slows down, so real meetings wobble around this value by up to about fourteen hours either way — but the average holds, and holds spectacularly. It differs from the modern measured mean month by well under a second.',
        'Stack twelve of them and a common lunar year is 354 days, 8 hours, 876 parts; thirteen give a leap year of 383 days, 21 hours, 589 parts (KH 6:4).',
      ],
    },

    {
      id: 'the-leftover',
      heading: 'Throw away the weeks',
      source: 'KH 6:5',
      nodeId: 'molad',
      body: [
        'Now the trick that makes the arithmetic small. For fixing the calendar, the only question about a molad is **which weekday, and when in that day** — chapter 7 needs nothing else. So whole weeks change nothing, and every span gets its weeks thrown away.',
        'A month of 29–12–793 is four whole weeks plus a leftover of **1–12–793**: add a month, and the molad lands one weekday later, twelve hours and 793 parts on. A common year boils down to **4–8–876**, a leap year to **5–21–589**.',
        'This is the same move the astronomy chapters make when they throw away whole circles of 360°. A lap of the week, like a lap of the sky, returns you to where you stood.',
      ],
    },

    {
      id: 'the-anchor',
      heading: 'The anchor: BaHaRaD',
      source: 'KH 6:8',
      nodeId: 'molad',
      body: [
        'Addition needs a starting value. His is the molad of Tishrei of year 1 of creation: **Monday, 5 hours, 204 parts** — remembered by the letters בהר"ד, which spell day 2, hour 5, part 204.',
        'Every molad in history is this anchor plus a whole number of months. Nothing is ever carried forward from last year\'s answer; each computation returns to the anchor — the same anchored counting as chapter 11\'s day count, and the reason nothing in either system can quietly accumulate an error.',
      ],
    },

    {
      id: 'the-cycle',
      heading: 'Nineteen years, seven of them leap',
      source: 'KH 6:10',
      nodeId: 'molad',
      body: [
        'Lunar months and solar years do not divide evenly — but nineteen solar years come remarkably close to **235 lunar months**. So the calendar runs in nineteen-year cycles with seven leap years each, at positions **3, 6, 8, 11, 14, 17 and 19**.',
        'How close is close? He does the sum himself: nineteen of his solar years overshoot 235 of his months by just **one hour and 485 parts** (KH 6:10) — about 87 minutes per nineteen years.',
        'A whole cycle, weeks thrown away, leaves the remainder **2–16–595** — one addition per nineteen years, for anyone computing far ahead.',
        'And this list is how anyone knows whether a year is leap: divide the year number by nineteen and keep what is left over — that is its position in the current cycle (nothing left over counts as position 19). On the list, leap; off it, common. Chapters 7 and 8 both lean on that one division.',
      ],
    },

    {
      id: 'worked',
      heading: 'The whole method on one card',
      source: 'KH 6:7',
      nodeId: 'molad',
      body: [
        'His worked example (6:7) adds one month to a molad of Nisan at 1–17–107: parts first, then hours with their carry, then days — landing on 3–5–900 for Iyar. The card below shows it, the published remainders, and the live molad of Tishrei for any year you type.',
        'Notice what kind of machine this is: an anchor, an interval, published shortcut totals, and addition — precisely the machine chapter 12 builds for the sun. He built it here first.',
      ],
      interactive: 'molad-ladder',
    },
  ],

  closing: {
    have: [
      'The molad — the average meeting of moon and sun — for any month of any year, by addition from one anchor.',
      'The units (1080 parts), the one interval (29–12–793), and the leftovers that make the sums small.',
      'The nineteen-year cycle and its seven leap years.',
    ],
    missing: [
      'The molad names a moment, not yet a calendar day. Rosh HaShanah does not simply fall wherever the molad does — four rules stand between them, and they are chapter 7.',
    ],
  },
};
