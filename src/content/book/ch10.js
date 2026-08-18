/**
 * Chapter 10 of the plain-language book — Rav Adda's exact fit.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REGIME TAG: **editorial** — NOT the Rambam, NOT a translation.
 *  SURFACE CATEGORY: teaching commentary
 * ═══════════════════════════════════════════════════════════════════
 *
 * The chapter's one big idea: Rav Adda's year is the year that makes
 * the 19-year cycle come out EXACTLY — 19 such years equal 235 months
 * to the moment, pinned in ch910.test.js. And its two closing
 * halachot (10:6-7) are the calendar arc's honest ending: which
 * tradition the courts leaned on, and the admission that both run on
 * the mean sun.
 */

export default {
  chapter: 10,
  sourceChapter: 10,
  title: "Rav Adda's seasons — the exact fit",
  hebrewTitle: 'תקופת רב אדא',
  subtitle:
    'Give up the round quarter-day and the nineteen-year cycle closes without remainder — at the price of a unit finer than the part.',

  terms: [
    {
      plain: 'a moment',
      formal: 'a rega',
      hebrew: 'רגע',
      gloss:
        'One seventy-sixth of a part — about 1/23 of a second. Rav Adda\'s year is not a round number of parts, so it needs a finer coin.',
    },
    {
      plain: 'the exact fit',
      formal: "Rav Adda's solar year",
      hebrew: 'שנת רב אדא',
      gloss:
        '365 days, 5 hours, 997 parts and 48 moments — defined so that nineteen of them equal 235 months exactly, with nothing left over.',
    },
  ],

  recap: {
    settled: [
      'Shmuel\'s seasons: the round 365¼-day year, seasons of 91 days 7½ hours, and the 28-year weekday round.',
      'The cost of the roundness: about 11 minutes a year against the real sun.',
    ],
    thisChapter:
      'The second tradition. Rav Adda\'s year is a little shorter and much less round — and in exchange, the nineteen-year cycle of chapter 6 closes exactly, to the moment.',
    byTheEnd:
      'You will know both of the calendar\'s solar traditions, which one the leap-year courts leaned on, and the honest limit the Rambam himself puts on both.',
  },

  sections: [
    {
      id: 'the-year',
      heading: 'A shorter year, and a finer coin to pay it in',
      source: 'KH 10:1',
      nodeId: 'seasons',
      body: [
        'Rav Adda\'s solar year is **365 days, 5 hours, 997 parts and 48 moments** — the moment (רגע) being a seventy-sixth of a part, a unit invented because this year refuses to land on a whole number of parts.',
        'From it follow the chapter\'s working numbers: a year outruns twelve lunar months by **10 days, 21 hours, 121 parts, 48 moments**, and each season is **91 days, 7 hours, 519 parts, 31 moments** — a quarter of the year, like Shmuel\'s, just not round.',
      ],
    },

    {
      id: 'exact-fit',
      heading: 'Why this strange number: the cycle closes',
      source: 'KH 10:1',
      nodeId: 'seasons',
      body: [
        'The number looks arbitrary and is the opposite. Take nineteen of Rav Adda\'s years, take 235 of chapter 6\'s months — and they are **exactly equal, to the moment**. Zero left over, where Shmuel\'s round year left the 1 hour 485 parts of KH 6:10.',
        'That is what the year *is*: 235 months divided by nineteen, expressed in days, hours, parts and moments. The moon\'s month is the measured thing; Rav Adda\'s sun is defined to fit the cycle that carries it. The strange digits are the fingerprint of that division.',
        'His anchor differs from Shmuel\'s by exactly a week\'s worth of framing: the first spring season-point falls **9 hours 642 parts before the first molad of Nisan** (10:3) — the same 9–642, without Shmuel\'s seven days.',
      ],
      interactive: 'season-ladder',
    },

    {
      id: 'which-and-why',
      heading: 'Which tradition the courts leaned on',
      source: 'KH 10:6',
      nodeId: 'seasons',
      body: [
        'Then he takes a side, with a phrase he reserves for his own judgement: **"it appears to me"** that when the courts fixed leap years by the season, they relied on *this* reckoning, Rav Adda\'s — because it is the more accurate, and closer to what the astronomers demonstrate.',
        'That sentence quietly ranks the two chapters: Shmuel\'s roundness for everyday reckoning, Rav Adda\'s fit where the law leaned on the answer.',
      ],
    },

    {
      id: 'honest-end',
      heading: 'The calendar arc\'s honest last word',
      source: 'KH 10:7',
      nodeId: 'seasons',
      body: [
        'And then the closing halacha, which is the whole book\'s method in one sentence. **Both** of these reckonings, he says, are approximations running on the sun\'s mean motion, not its true position — and against the true sun, the spring season-point falls about **two days earlier** than either computes.',
        'Mean versus true: the same gap chapter 7 gave as the reason for the postponements, and the same gap chapters 12 and 13 will spend two chapters closing for the sun. And his "about two days" is not a loose guess — the spring point sits nearly a quarter-circle from the sun\'s far point, exactly where chapter 13\'s correction peaks at 1° 59\', which is two days of the sun\'s travel. Run his own machinery and his mean sun crosses the spring point two days after his true sun, to the day.',
        'So the calendar chapters end by pointing directly at the astronomy — which is where this book\'s chapter 11 begins, and which closes those two days down to the half-degree the reality checks of chapters 13 and 14 display.',
      ],
    },
  ],

  closing: {
    have: [
      'Both solar traditions: Shmuel\'s round year and Rav Adda\'s exact fit, with the anchors and season lengths of each.',
      'His own ranking (10:6) and his own caveat (10:7): both are means, and the true equinox runs about two days ahead.',
      'With chapters 6-8: the complete fixed calendar, moon and sun.',
    ],
    missing: [
      'Chapters 1 to 5 — the court, the witnesses, the messengers, and the leap-year deliberations — remain in the source text. From here, the astronomy: chapter 11 opens the method that replaces the mean sun with the true one.',
    ],
  },
};
