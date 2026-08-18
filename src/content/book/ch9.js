/**
 * Chapter 9 of the plain-language book — Shmuel's seasons.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The connective fact this chapter hands the whole book: KH 9:3
 * DEFINES the four seasons as the sun entering the starts of the 1st,
 * 4th, 7th and 10th signs — the same four anchors chapters 14, 17 and
 * 19 kept meeting. The reader should feel that click.
 */

export default {
  chapter: 9,
  sourceChapter: 9,
  title: "Shmuel's seasons — the round quarter-day",
  hebrewTitle: 'תקופת שמואל',
  subtitle:
    'A solar year of exactly 365¼ days, seasons of 91 days and 7½ hours, and arithmetic simple enough to do at a table.',

  terms: [
    {
      plain: 'a season-point',
      formal: 'a tekufah',
      hebrew: 'תקופה',
      gloss:
        'The moment a season begins: the sun entering the start of the 1st sign (spring), the 4th (summer), the 7th (autumn) or the 10th (winter). The same four anchor points the astronomy chapters keep returning to.',
    },
    {
      plain: 'the round year',
      formal: "Shmuel's solar year",
      hebrew: 'שנת שמואל',
      gloss:
        'Exactly 365 days and 6 hours. Deliberately round — it makes every season an identical 91 days 7½ hours, and the whole weekday pattern repeat every 28 years.',
    },
  ],

  recap: {
    settled: [
      'The molad of any month, the day of any Rosh HaShanah, and the shape of any year — the lunar half of the fixed calendar, complete.',
    ],
    thisChapter:
      'The calendar also needs the SUN: leap years exist to keep Pesach beside the spring season-point. This chapter tracks the seasons with the simpler of two traditions — Shmuel\'s round year.',
    byTheEnd:
      'You will be able to place the four season-points of any year to the weekday and hour, with arithmetic no harder than chapter 6\'s.',
  },

  sections: [
    {
      id: 'two-opinions',
      heading: 'Two answers for the length of a year',
      source: 'KH 9:1',
      nodeId: 'seasons',
      body: [
        'How long does the sun take to come back to the same season-point? The Sages of Israel carry two answers — some say exactly **365¼ days** (Shmuel\'s figure), some say slightly less (Rav Adda\'s, next chapter) — and he notes the sages of Greece and Persia argued the same question.',
        'This chapter runs the first answer to the end. Its charm is roundness: a quarter-day divides evenly into everything, and the arithmetic stays small.',
      ],
    },

    {
      id: 'the-four-points',
      heading: 'The four season-points are the four anchors',
      source: 'KH 9:3',
      nodeId: 'seasons',
      body: [
        'What is a season, exactly? He defines the four: spring begins when the sun enters **the start of the 1st sign**; summer, the start of the **4th**; autumn, the **7th**; winter, the **10th**.',
        'A reader who came here from the astronomy chapters should feel a click. These are the four anchor points the whole book kept meeting — where chapter 14 proved his circle is season-anchored, where the slice peaks and vanishes, where the tilt of chapter 19 turns. Here is where they are *named*: the seasons and those four sign-starts are the same thing by definition.',
        'His anchor for the count: the spring season-point of year 1 fell **7 days, 9 hours, 642 parts before the first molad of Nisan** (9:3).',
      ],
    },

    {
      id: 'the-arithmetic',
      heading: 'Quarter-days make easy sums',
      source: 'KH 9:2',
      nodeId: 'seasons',
      body: [
        'A year of 365¼ days cuts into four identical seasons of **91 days, 7½ hours**. Know one season-point and the next is one addition away — the same ladder as the moladot, with a different rung.',
        'And the round quarter pays twice. A year is 52 weeks plus exactly **1 day 6 hours**, so a season-point walks the week in neat quarter-day steps — and after **28 years** it returns to the very same weekday and hour. (That 28-year round is the cycle behind the once-a-generation blessing of the sun.)',
        'His own worked example (9:5) finds the spring season-point of year 4930 — the year the commentaries take as the one he was writing in — by dividing into 28s and walking the remainder.',
      ],
      interactive: 'season-ladder',
    },

    {
      id: 'honest',
      heading: 'What this simplicity costs',
      source: 'KH 9:2',
      nodeId: 'seasons',
      body: [
        'The round year is not the real year. It is about **11 minutes too long**, so Shmuel\'s season-points drift later against the real sky by roughly a day every 128 years — the same kind of drift that pushed the civil world from the Julian calendar to the Gregorian, and for the same reason: 365¼ is beautifully divisible and slightly wrong.',
        'The Rambam does not hide it. The next chapter carries the finer tradition, and ends by saying plainly which one the courts leaned on and why — and that *both* run on the **mean** sun rather than the true one — the mean sun being a pretend sun that moves at a perfectly steady average pace, where the true sun is where the sun actually stands.',
        'And is any of this **used**? Downstream of these two chapters, nothing consumes them: the fixed calendar already walks to Rav Adda\'s beat — the nineteen-year cycle *is* his year, as chapter 10 shows — and the astronomy of chapters 12-13 supersedes both with the true sun (13:11). What survives of Shmuel\'s is living custom: the once-in-28-years blessing of the sun falls on his cycle, and the diaspora\'s early-December start for asking rain in the daily prayer is sixty days after his autumn tekufah, drift included. The card below puts all the real numbers side by side.',
      ],
    },
  ],

  closing: {
    have: [
      'The four season-points of any year, to the weekday and hour, by Shmuel\'s round arithmetic.',
      'The definition that ties the calendar to the astronomy: seasons ARE the sun entering the 1st, 4th, 7th and 10th signs.',
    ],
    missing: [
      'The finer tradition. Rav Adda\'s year gives up the round quarter-day and gains something remarkable in exchange: the nineteen-year cycle comes out exact. That is chapter 10.',
    ],
  },
};
